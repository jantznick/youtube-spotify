import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import { XMLParser } from 'fast-xml-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Get dump date from command line or find latest
const getDumpDate = () => {
  const args = process.argv.slice(2);
  if (args.length > 0) {
    return args[0];
  }
  // Find latest dump
  const dataDir = path.join(__dirname, '..', 'data', 'discogs');
  if (!fs.existsSync(dataDir)) {
    throw new Error('No data directory found. Run download script first.');
  }
  const files = fs.readdirSync(dataDir)
    .filter(f => f.startsWith('discogs_') && f.endsWith('_artists.xml'))
    .sort()
    .reverse();
  if (files.length === 0) {
    throw new Error('No artists XML files found. Run download script first.');
  }
  // Extract date from filename: discogs_20260101_artists.xml -> 2026-01
  const match = files[0].match(/discogs_(\d{4})(\d{2})\d{2}_artists\.xml/);
  if (!match) {
    throw new Error('Could not parse date from filename');
  }
  return `${match[1]}-${match[2]}`;
};

// Main processing function
async function processDiscogsArtists() {
  const dumpDate = getDumpDate();
  console.log(`\n🎵 Processing Discogs Artists`);
  console.log(`📅 Dump Date: ${dumpDate}\n`);

  // Find XML file
  const [year, month] = dumpDate.split('-');
  const dataDir = path.join(__dirname, '..', 'data', 'discogs');
  const xmlFileName = `discogs_${year}${month}01_artists.xml`;
  const xmlPath = path.join(dataDir, xmlFileName);

  if (!fs.existsSync(xmlPath)) {
    throw new Error(`Artists XML file not found: ${xmlPath}\nRun download script first.`);
  }

  // Get or create sync record (each dumpDate gets its own record)
  let syncRecord = await prisma.discogsDataSync.findUnique({
    where: { dumpDate },
  });

  if (!syncRecord) {
    // New dump - start fresh
    syncRecord = await prisma.discogsDataSync.create({
      data: {
        id: dumpDate,
        dumpDate,
        status: 'processing',
        startedAt: new Date(),
      },
    });
    console.log(`📅 New dump detected: ${dumpDate} - starting from 0\n`);
  } else {
    // Existing dump - check if we're resuming
    syncRecord = await prisma.discogsDataSync.update({
      where: { dumpDate },
      data: {
        status: 'processing',
        startedAt: new Date(),
        error: null,
      },
    });
    if (syncRecord.artistsProcessed > 0) {
      console.log(`📅 Resuming dump: ${dumpDate}`);
      console.log(`   Previously processed: ${syncRecord.artistsProcessed.toLocaleString()} artists\n`);
    }
  }

  const fileSize = fs.statSync(xmlPath).size;
  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  console.log(`📁 File: ${xmlFileName} (${fileSizeMB}MB)\n`);

  // Stats
  let processed = 0;
  let created = 0;
  let updated = 0;
  let errors = 0;
  let skipped = 0;
  const startTime = Date.now();
  
  // Timing metrics
  let totalProcessingTime = 0;
  let slowestArtistTime = 0;
  let slowestArtistName = null;
  let lastSyncUpdate = 0;

  // Create XML parser
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    textNodeName: '#text',
    parseAttributeValue: false,
  });

  // Create readline interface
  const fileStream = fs.createReadStream(xmlPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  console.log(`🚀 Starting line-by-line processing...\n`);
  console.log(`   Reading from: ${xmlPath}\n`);

  // Process line by line
  for await (const line of rl) {
    // Skip empty lines and XML header/footer
    if (!line.trim() || line.trim().startsWith('<?xml') || line.trim() === '<artists>' || line.trim() === '</artists>') {
      continue;
    }

    // Each line should be a complete <artist>...</artist> element
    if (line.trim().startsWith('<artist') && line.trim().endsWith('</artist>')) {
      try {
        // Parse the XML line
        const parsed = parser.parse(line);
        const artist = parsed.artist;

        if (!artist || !artist.name) {
          skipped++;
          continue;
        }

        const artistName = artist.name.trim();
        
        // Skip artists without a profile
        if (!artist.profile || !artist.profile.trim()) {
          skipped++;
          continue;
        }

        const artistStartTime = Date.now();
        processed++;

        try {
          // Prepare data
          const artistData = {
            name: artistName,
            realname: artist.realname?.trim() || null,
            profile: artist.profile?.trim() || null,
            dataQuality: artist.dataQuality?.trim() || null,
            urls: artist.urls?.url ? (Array.isArray(artist.urls.url) ? artist.urls.url : [artist.urls.url]) : null,
            nameVariations: artist.namevariations?.name ? (Array.isArray(artist.namevariations.name) ? artist.namevariations.name : [artist.namevariations.name]) : null,
            aliases: artist.aliases?.name ? (Array.isArray(artist.aliases.name) ? artist.aliases.name.map(n => ({ name: n })) : [{ name: artist.aliases.name }]) : null,
            members: artist.members?.name ? (Array.isArray(artist.members.name) ? artist.members.name.map(n => ({ name: n })) : [{ name: artist.members.name }]) : null,
            groups: artist.groups?.name ? (Array.isArray(artist.groups.name) ? artist.groups.name.map(n => ({ name: n })) : [{ name: artist.groups.name }]) : null,
            lastUpdated: new Date(),
          };

          const existingArtist = await prisma.discogsArtist.findUnique({
            where: { name: artistData.name },
            select: { id: true },
          });
          
          await prisma.discogsArtist.upsert({
            where: { name: artistData.name },
            update: {
              realname: artistData.realname,
              profile: artistData.profile,
              dataQuality: artistData.dataQuality,
              urls: artistData.urls,
              nameVariations: artistData.nameVariations,
              aliases: artistData.aliases,
              members: artistData.members,
              groups: artistData.groups,
              lastUpdated: artistData.lastUpdated,
            },
            create: artistData,
          });
          
          if (!existingArtist) {
            created++;
          } else {
            updated++;
            skipped++;
          }

          // Update sync record periodically
          if (processed - lastSyncUpdate >= 1000) {
            await prisma.discogsDataSync.update({
              where: { dumpDate },
              data: { artistsProcessed: processed },
            });
            lastSyncUpdate = processed;
          }

          const artistProcessingTime = Date.now() - artistStartTime;
          totalProcessingTime += artistProcessingTime;
          
          if (artistProcessingTime > slowestArtistTime) {
            slowestArtistTime = artistProcessingTime;
            slowestArtistName = artistName;
          }

          if (processed % 100 === 0) {
            const elapsed = (Date.now() - startTime) / 1000;
            const newlyProcessed = processed - skipped;
            const rate = processed > 0 ? processed / elapsed : 0;
            const avgProcessingTime = processed > 0 ? (totalProcessingTime / processed).toFixed(1) : '0';
            console.log(`   Total: ${processed.toLocaleString()} | New: ${newlyProcessed.toLocaleString()} | Skipped: ${skipped.toLocaleString()} | Created: ${created.toLocaleString()} | Updated: ${updated.toLocaleString()} | Errors: ${errors} | Rate: ${rate.toFixed(0)}/s | Avg: ${avgProcessingTime}ms/artist`);
          }
        } catch (error) {
          errors++;
          if (errors <= 10) {
            console.error(`Error processing artist "${artistName}":`, error.message);
          }
        }
      } catch (error) {
        errors++;
        if (errors <= 10) {
          console.error(`Error parsing artist line:`, error.message);
        }
      }
    }
  }

  // Final summary
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  const newlyProcessed = processed - skipped;
  const rate = processed > 0 ? (processed / parseFloat(elapsed)).toFixed(0) : '0';
  const avgProcessingTime = processed > 0 ? (totalProcessingTime / processed).toFixed(1) : '0';
  const totalProcessingTimeSeconds = (totalProcessingTime / 1000).toFixed(1);
  const elapsedSeconds = parseFloat(elapsed);
  const dbTimePercentage = elapsedSeconds > 0 ? ((totalProcessingTime / 1000) / elapsedSeconds * 100).toFixed(1) : '0';
  
  console.log(`\n✅ Processing complete!`);
  console.log(`   Total Artists in XML: ${processed.toLocaleString()}`);
  console.log(`   Skipped: ${skipped.toLocaleString()}`);
  console.log(`   Newly Processed: ${newlyProcessed.toLocaleString()}`);
  console.log(`   Created: ${created.toLocaleString()}`);
  console.log(`   Updated: ${updated.toLocaleString()}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total Time: ${elapsed}s`);
  console.log(`   DB Processing Time: ${totalProcessingTimeSeconds}s (${dbTimePercentage}% of total)`);
  console.log(`   Avg Processing Time: ${avgProcessingTime}ms per artist`);
  if (slowestArtistName && slowestArtistTime > 100) {
    console.log(`   Slowest Artist: "${slowestArtistName}" (${slowestArtistTime}ms)`);
  }
  const finalRate = newlyProcessed > 0 ? (newlyProcessed / elapsedSeconds).toFixed(0) : '0';
  console.log(`   Rate: ${finalRate} artists/s\n`);

  // Final sync record update
  await prisma.discogsDataSync.update({
    where: { dumpDate },
    data: {
      artistsProcessed: processed,
      status: 'completed',
      completedAt: new Date(),
    },
  });

  await prisma.$disconnect();
}

// Run if called directly
if (process.argv[1]?.includes('process-discogs-artists.js')) {
  processDiscogsArtists()
    .then(() => {
      console.log(`\n✅ Artists processing complete!\n`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default processDiscogsArtists;
