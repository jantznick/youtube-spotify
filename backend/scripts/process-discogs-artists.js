import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import sax from 'sax';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Parse duration string "4:45" to seconds
const parseDuration = (durationStr) => {
  if (!durationStr) return null;
  const parts = durationStr.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  }
  return null;
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

  const isNewDump = !syncRecord;
  
  if (!syncRecord) {
    // New dump - start fresh
    syncRecord = await prisma.discogsDataSync.create({
      data: {
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
  let processed = 0; // Count of artists seen in XML
  let created = 0;
  let updated = 0;
  let errors = 0;
  let skipped = 0; // Count of artists skipped because they already exist
  const startTime = Date.now();
  
  // Timing metrics
  let totalProcessingTime = 0; // Total time spent processing artists (DB operations)
  let slowestArtistTime = 0;
  let slowestArtistName = null;

  // Current artist being parsed
  let currentArtist = null;
  let currentElement = null;
  let currentText = '';
  const elementStack = [];

  // Simple lock to ensure only one artist is processed at a time
  // Wait for DB operation to complete before processing next artist
  let isProcessing = false;
  let lastSyncUpdate = 0;

  // Create a promise that resolves when parsing is complete
  let resolveParser;
  let rejectParser;
  const parserPromise = new Promise((resolve, reject) => {
    resolveParser = resolve;
    rejectParser = reject;
  });

  // Create SAX parser
  const parser = sax.createStream(true, { lowercase: true });
  parser.onerror = (err) => {
    console.error('❌ XML Parse Error:', err);
    errors++;
    rejectParser(err);
  };

  // Handle opening tags
  parser.onopentag = (node) => {
    elementStack.push(node.name);
    currentElement = node.name;

    // Debug: log first few artist tags
    if (node.name === 'artist' && processed < 3) {
    }

    if (node.name === 'artist') {
      currentArtist = {
        id: null,
        name: null,
        realname: null,
        profile: null,
        dataQuality: null,
        urls: [],
        nameVariations: [],
        aliases: [],
        members: [],
        groups: [],
      };
      currentText = '';
    } else if (node.name === 'name' && elementStack.length > 1 && elementStack[elementStack.length - 2] === 'namevariations') {
      // Name variation - start collecting text
      currentText = '';
    } else if (node.name === 'name' && node.attributes?.id && elementStack.length > 1 && elementStack[elementStack.length - 2] === 'aliases') {
      // Alias with ID
      if (currentArtist) {
        currentArtist.aliases.push({
          id: node.attributes.id,
          name: '',
        });
      }
      currentText = '';
    } else if (node.name === 'name' && node.attributes?.id && elementStack.length > 1 && elementStack[elementStack.length - 2] === 'members') {
      // Member with ID
      if (currentArtist) {
        currentArtist.members.push({
          id: node.attributes.id,
          name: '',
        });
      }
      currentText = '';
    } else if (node.name === 'name' && node.attributes?.id && elementStack.length > 1 && elementStack[elementStack.length - 2] === 'groups') {
      // Group with ID
      if (currentArtist) {
        currentArtist.groups.push({
          id: node.attributes.id,
          name: '',
        });
      }
      currentText = '';
    } else if (node.name === 'url' && elementStack.length > 1 && elementStack[elementStack.length - 2] === 'urls') {
      // URL - start collecting text
      currentText = '';
    } else {
      currentText = '';
    }
  };

  // Handle text content
  parser.ontext = (text) => {
    if (!currentArtist) return;

    const parent = elementStack.length > 1 ? elementStack[elementStack.length - 2] : null;

    if (currentElement === 'id' && parent === 'artist') {
      currentArtist.id = (currentArtist.id || '') + text.trim();
    } else if (currentElement === 'name' && parent === 'artist') {
      currentArtist.name = (currentArtist.name || '') + text.trim();
    } else if (currentElement === 'realname' && parent === 'artist') {
      currentArtist.realname = (currentArtist.realname || '') + text.trim();
    } else if (currentElement === 'profile' && parent === 'artist') {
      currentArtist.profile = (currentArtist.profile || '') + text;
    } else if (currentElement === 'data_quality' && parent === 'artist') {
      currentArtist.dataQuality = (currentArtist.dataQuality || '') + text.trim();
    } else if (currentElement === 'name' && parent === 'namevariations') {
      currentText += text;
    } else if (currentElement === 'name' && parent === 'aliases' && currentArtist.aliases.length > 0) {
      // Update the last alias name
      const lastAlias = currentArtist.aliases[currentArtist.aliases.length - 1];
      lastAlias.name = (lastAlias.name || '') + text;
    } else if (currentElement === 'name' && parent === 'members' && currentArtist.members.length > 0) {
      // Update the last member name
      const lastMember = currentArtist.members[currentArtist.members.length - 1];
      lastMember.name = (lastMember.name || '') + text;
    } else if (currentElement === 'name' && parent === 'groups' && currentArtist.groups.length > 0) {
      // Update the last group name
      const lastGroup = currentArtist.groups[currentArtist.groups.length - 1];
      lastGroup.name = (lastGroup.name || '') + text;
    } else if (currentElement === 'url' && parent === 'urls') {
      currentText += text;
    }
  };

  // Handle closing tags
  parser.onclosetag = async (tagName) => {
    // Check parent before popping
    const parent = elementStack.length > 1 ? elementStack[elementStack.length - 2] : null;

    if (tagName === 'artist' && currentArtist) {
      // CRITICAL: Store ALL data from currentArtist BEFORE any async operations
      // because currentArtist might be set to null by other handlers
      const artistName = currentArtist.name?.trim();
      const discogsId = currentArtist.id?.trim() || null;
      const realname = currentArtist.realname?.trim() || null;
      const profile = currentArtist.profile?.trim() || null;
      const dataQuality = currentArtist.dataQuality?.trim() || null;
      const urls = currentArtist.urls?.length > 0 ? currentArtist.urls : null;
      const nameVariations = currentArtist.nameVariations?.length > 0 ? currentArtist.nameVariations : null;
      const aliases = currentArtist.aliases?.length > 0 ? currentArtist.aliases : null;
      const members = currentArtist.members?.length > 0 ? currentArtist.members : null;
      const groups = currentArtist.groups?.length > 0 ? currentArtist.groups : null;
      
      // Clear currentArtist immediately to prevent race conditions
      currentArtist = null;
      
      // Validate required fields - we need name
      if (!artistName) {
        errors++;
        const artistId = discogsId || 'unknown';
        console.error(`Error processing artist ${artistId}: Missing required field (name)`);
        return;
      }
      
      // Wait if another artist is currently being processed
      // CRITICAL: Wait BEFORE incrementing processed to ensure sequential processing
      while (isProcessing) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Process this artist immediately, waiting for DB to complete
      isProcessing = true;
      
      // Only increment processed AFTER acquiring the lock
      processed++;
      const shouldLog = processed % 100 === 0;
      
      const artistStartTime = Date.now();
      try {
          // Prepare data - use name as unique identifier, store discogsId separately
          const artistData = {
            discogsId: discogsId,
            name: artistName,
            realname: realname,
            profile: profile,
            dataQuality: dataQuality,
            urls: urls,
            nameVariations: nameVariations,
            aliases: aliases,
            members: members,
            groups: groups,
            lastUpdated: new Date(),
            // updatedAt will be set automatically by Prisma due to @updatedAt
          };

          // Upsert artist (will create if new, update if exists)
          try {
            // Check if artist exists first to accurately track created vs updated
            const existingArtist = await prisma.discogsArtist.findUnique({
              where: { name: artistData.name },
              select: { id: true },
            });
            
            const result = await prisma.discogsArtist.upsert({
              where: { name: artistData.name },
              update: {
                discogsId: artistData.discogsId,
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
            
            // Use the existence check instead of unreliable timestamp comparison
            if (!existingArtist) {
              created++;
              // Debug: log first few creates to verify logic is working
              if (created <= 10) {
                console.log(`   🐛 DEBUG: Creating artist "${artistData.name}" (created count: ${created}, processed: ${processed})`);
              }
            } else {
              updated++;
              skipped++; // Artist already existed (was updated, not created)
            }
          } catch (error) {
            // Always log errors - remove the limit to see what's actually failing
            if (errors < 50 || errors % 1000 === 0) {
              console.error(`Error upserting artist "${artistData.name}" (processed: ${processed}):`, error.message);
              if (errors < 10) {
                console.error(`   Full error:`, error);
              }
            }
            errors++;
          }

          // Update sync record periodically (every 1000 artists) to reduce DB load
          if (processed - lastSyncUpdate >= 1000) {
            await prisma.discogsDataSync.update({
              where: { dumpDate },
              data: { artistsProcessed: processed },
            });
            lastSyncUpdate = processed;
          }

          // Track timing for this artist
          const artistProcessingTime = (Date.now() - artistStartTime);
          totalProcessingTime += artistProcessingTime;
          
          // Track slowest artist
          if (artistProcessingTime > slowestArtistTime) {
            slowestArtistTime = artistProcessingTime;
            slowestArtistName = artistName;
          }
          
          // Log progress every 100 artists (if we determined we should log earlier)
          if (shouldLog) {
            const elapsed = (Date.now() - startTime) / 1000;
            const newlyProcessed = processed - skipped;
            const rate = processed > 0 ? processed / elapsed : 0;
            const avgProcessingTime = processed > 0 ? (totalProcessingTime / processed).toFixed(1) : '0';
            console.log(`   Total: ${processed.toLocaleString()} | New: ${newlyProcessed.toLocaleString()} | Skipped: ${skipped.toLocaleString()} | Created: ${created.toLocaleString()} | Updated: ${updated.toLocaleString()} | Errors: ${errors} | Rate: ${rate.toFixed(0)}/s | Avg: ${avgProcessingTime}ms/artist`);
          }
      } catch (error) {
        // Use stored artistName if available, otherwise try discogsId
        const errorArtistName = artistName || discogsId || 'unknown';
        console.error(`Error processing artist "${errorArtistName}":`, error.message);
        if (errors < 10) {
          console.error(`   Full error:`, error);
        }
        errors++;
      } finally {
        const artistProcessingTime = (Date.now() - artistStartTime);
        totalProcessingTime += artistProcessingTime;
        isProcessing = false;
      }
      
      // Return early - elementStack will be popped at the end of onclosetag
      return;
    } else if (tagName === 'name' && parent === 'namevariations') {
      // Save name variation (before popping)
      if (currentText.trim() && currentArtist) {
        currentArtist.nameVariations.push(currentText.trim());
      }
      currentText = '';
    } else if (tagName === 'name' && parent === 'members') {
      // Save member name (before popping)
      if (currentText.trim() && currentArtist && currentArtist.members.length > 0) {
        const lastMember = currentArtist.members[currentArtist.members.length - 1];
        lastMember.name = currentText.trim();
      }
      currentText = '';
    } else if (tagName === 'name' && parent === 'groups') {
      // Save group name (before popping)
      if (currentText.trim() && currentArtist && currentArtist.groups.length > 0) {
        const lastGroup = currentArtist.groups[currentArtist.groups.length - 1];
        lastGroup.name = currentText.trim();
      }
      currentText = '';
    } else if (tagName === 'url' && parent === 'urls') {
      // Save URL (before popping)
      if (currentText.trim() && currentArtist) {
        currentArtist.urls.push(currentText.trim());
      }
      currentText = '';
    }

    elementStack.pop();
    currentElement = elementStack.length > 0 ? elementStack[elementStack.length - 1] : null;
  };

  // Process remaining batch
  parser.onend = async () => {
    try {
      console.log(`\n📊 Parser ended.`);
      console.log(`   Waiting for final artist to finish processing...`);
      
      // Wait for any in-flight artist to finish processing
      while (isProcessing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`   Processed so far: ${processed}`);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      const newlyProcessed = processed - skipped;
      const rate = processed > 0 ? (processed / parseFloat(elapsed)).toFixed(0) : '0';

      const avgProcessingTime = processed > 0 ? (totalProcessingTime / processed).toFixed(1) : '0';
      const totalProcessingTimeSeconds = (totalProcessingTime / 1000).toFixed(1);
      const elapsedSeconds = parseFloat(elapsed);
      const dbTimePercentage = elapsedSeconds > 0 ? ((totalProcessingTime / 1000) / elapsedSeconds * 100).toFixed(1) : '0';
      
      console.log(`\n✅ Processing complete!`);
      console.log(`   Total Artists in XML: ${processed.toLocaleString()}`);
      console.log(`   Skipped (already in DB): ${skipped.toLocaleString()}`);
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
      resolveParser();
    } catch (error) {
      await prisma.$disconnect();
      rejectParser(error);
    }
  };


  // Start processing
  console.log(`🚀 Starting XML stream processing...\n`);
  console.log(`   Reading from: ${xmlPath}\n`);
  
  const readStream = fs.createReadStream(xmlPath);
  
  readStream.on('error', (err) => {
    console.error('❌ Stream error:', err);
    rejectParser(err);
  });
  
  let chunkCount = 0;
  readStream.on('data', (chunk) => {
    chunkCount++;
    // Log first few chunks to verify stream is working
    if (chunkCount <= 3) {
      console.log(`   Stream chunk #${chunkCount}: ${chunk.length} bytes`);
    }
  });
  
  readStream.on('end', () => {
    console.log(`   Stream ended after ${chunkCount} chunks`);
  });
  
  parser.on('ready', () => {
    console.log('   Parser ready, starting to parse...\n');
  });
  
  readStream.pipe(parser);
  
  // Wait for parser to complete
  return parserPromise;
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

export { processDiscogsArtists };
