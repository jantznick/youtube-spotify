import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import readline from 'readline';
import path from 'path';
import { fileURLToPath } from 'url';
import { XMLParser } from 'fast-xml-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Check for debug mode
const isDebugMode = process.argv.includes('--debug');

// Get dump date from command line or find latest
const getDumpDate = () => {
  const args = process.argv.filter(arg => !arg.startsWith('--'));
  if (args.length > 2) {
    return args[2];
  }
  // Find latest dump
  const dataDir = path.join(__dirname, '..', 'data', 'discogs');
  if (!fs.existsSync(dataDir)) {
    throw new Error('No data directory found. Run download script first.');
  }
  const files = fs.readdirSync(dataDir)
    .filter(f => f.startsWith('discogs_') && f.endsWith('_releases.xml'))
    .sort()
    .reverse();
  if (files.length === 0) {
    throw new Error('No releases XML files found. Run download script first.');
  }
  // Extract date from filename: discogs_20260101_releases.xml -> 2026-01
  const match = files[0].match(/discogs_(\d{4})(\d{2})\d{2}_releases\.xml/);
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

// Extract YouTube ID from URL
const extractYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : null;
};

// Main processing function
async function processDiscogsReleases() {
  const dumpDate = getDumpDate();
  console.log(`\n🎵 Processing Discogs Releases`);
  console.log(`📅 Dump Date: ${dumpDate}`);
  if (isDebugMode) {
    console.log(`🐛 DEBUG MODE: Only processing first 3 releases\n`);
  }

  // Find XML file
  const [year, month] = dumpDate.split('-');
  const dataDir = path.join(__dirname, '..', 'data', 'discogs');
  const xmlFileName = `discogs_${year}${month}01_releases.xml`;
  const xmlPath = path.join(dataDir, xmlFileName);

  if (!fs.existsSync(xmlPath)) {
    throw new Error(`Releases XML file not found: ${xmlPath}\nRun download script first.`);
  }

  // Get or create sync record
  let syncRecord = await prisma.discogsDataSync.findUnique({
    where: { dumpDate },
  });

  if (!syncRecord) {
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
    syncRecord = await prisma.discogsDataSync.update({
      where: { dumpDate },
      data: {
        status: 'processing',
        startedAt: new Date(),
        error: null,
      },
    });
    if (syncRecord.releasesProcessed > 0) {
      console.log(`📅 Resuming dump: ${dumpDate}`);
      console.log(`   Previously processed: ${syncRecord.releasesProcessed.toLocaleString()} releases\n`);
    }
  }

  const fileSize = fs.statSync(xmlPath).size;
  const fileSizeMB = (fileSize / (1024 * 1024)).toFixed(2);
  console.log(`📁 File: ${xmlFileName} (${fileSizeMB}MB)\n`);

  // Stats - always start fresh (counters reset on each run)
  let processed = 0;
  let created = 0;
  let updated = 0;
  let errors = 0;
  let skipped = 0;
  let tracksProcessed = 0;
  let songsUpserted = 0;
  const startTime = Date.now();
  
  // Timing metrics
  let totalProcessingTime = 0;
  let slowestReleaseTime = 0;
  let slowestReleaseTitle = null;
  let lastSyncUpdate = 0;

  // Create XML parser
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    textNodeName: '#text',
    parseAttributeValue: false,
    parseTrueNumberOnly: false,
  });

  // Create readline interface
  const fileStream = fs.createReadStream(xmlPath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  console.log(`🚀 Starting line-by-line processing...\n`);
  console.log(`   Reading from: ${xmlPath}\n`);

  let releaseBuffer = '';
  let inRelease = false;

  // Process line by line
  for await (const line of rl) {
    // Skip empty lines and XML header/footer
    if (!line.trim() || line.trim().startsWith('<?xml') || line.trim() === '<releases>' || line.trim() === '</releases>') {
      continue;
    }

    // Check if line starts a release
    if (line.trim().startsWith('<release')) {
      inRelease = true;
      releaseBuffer = line;
      
      // Check if it's complete on one line
      if (line.trim().endsWith('</release>')) {
        // Process this release
        const stats = {
          processed, created, updated, errors, skipped, tracksProcessed, songsUpserted,
          totalProcessingTime, slowestReleaseTime, slowestReleaseTitle, lastSyncUpdate,
          dumpDate, isDebugMode, startTime
        };
        await processRelease(releaseBuffer, parser, stats);
        
        // Update local variables from stats (including processed which is incremented inside processRelease)
        processed = stats.processed;
        created = stats.created;
        updated = stats.updated;
        errors = stats.errors;
        skipped = stats.skipped;
        tracksProcessed = stats.tracksProcessed;
        songsUpserted = stats.songsUpserted;
        totalProcessingTime = stats.totalProcessingTime;
        slowestReleaseTime = stats.slowestReleaseTime;
        slowestReleaseTitle = stats.slowestReleaseTitle;
        lastSyncUpdate = stats.lastSyncUpdate;
        
        releaseBuffer = '';
        inRelease = false;
        
        if (isDebugMode && processed >= 3) {
          break;
        }
      }
    } else if (inRelease) {
      // Continue buffering
      releaseBuffer += line;
      
      // Check if release ends on this line
      if (line.trim().endsWith('</release>')) {
        // Process this release
        const stats = {
          processed, created, updated, errors, skipped, tracksProcessed, songsUpserted,
          totalProcessingTime, slowestReleaseTime, slowestReleaseTitle, lastSyncUpdate,
          dumpDate, isDebugMode, startTime
        };
        await processRelease(releaseBuffer, parser, stats);
        
        // Update local variables from stats (including processed which is incremented inside processRelease)
        processed = stats.processed;
        created = stats.created;
        updated = stats.updated;
        errors = stats.errors;
        skipped = stats.skipped;
        tracksProcessed = stats.tracksProcessed;
        songsUpserted = stats.songsUpserted;
        totalProcessingTime = stats.totalProcessingTime;
        slowestReleaseTime = stats.slowestReleaseTime;
        slowestReleaseTitle = stats.slowestReleaseTitle;
        lastSyncUpdate = stats.lastSyncUpdate;
        
        releaseBuffer = '';
        inRelease = false;
        
        if (isDebugMode && processed >= 3) {
          break;
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
  console.log(`   Total Releases in XML: ${processed.toLocaleString()}`);
  console.log(`   Skipped: ${skipped.toLocaleString()}`);
  console.log(`   Newly Processed: ${newlyProcessed.toLocaleString()}`);
  console.log(`   Created: ${created.toLocaleString()}`);
  console.log(`   Updated: ${updated.toLocaleString()}`);
  console.log(`   Tracks Processed: ${tracksProcessed.toLocaleString()}`);
  console.log(`   Songs Upserted: ${songsUpserted.toLocaleString()}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total Time: ${elapsed}s`);
  console.log(`   DB Processing Time: ${totalProcessingTimeSeconds}s (${dbTimePercentage}% of total)`);
  console.log(`   Avg Processing Time: ${avgProcessingTime}ms per release`);
  if (slowestReleaseTitle && slowestReleaseTime > 100) {
    console.log(`   Slowest Release: "${slowestReleaseTitle}" (${slowestReleaseTime}ms)`);
  }
  const finalRate = newlyProcessed > 0 ? (newlyProcessed / elapsedSeconds).toFixed(0) : '0';
  console.log(`   Rate: ${finalRate} releases/s\n`);

  // Final sync record update
  await prisma.discogsDataSync.update({
    where: { dumpDate },
    data: {
      releasesProcessed: processed,
      tracksProcessed: tracksProcessed,
      songsUpserted: songsUpserted,
      status: 'completed',
      completedAt: new Date(),
    },
  });

  await prisma.$disconnect();
}

// Process a single release
async function processRelease(releaseXml, parser, stats) {
  const releaseStartTime = Date.now();
  
  try {
    // Parse the XML
    const parsed = parser.parse(releaseXml);
    const release = parsed.release;

    if (!release || !release.id || !release.title || !release.status) {
      stats.errors++;
      return;
    }

    const releaseId = release.id;
    const releaseTitle = String(release.title).trim();
    const releaseStatus = release.status;

    // Extract release data
    const genres = release.genres?.genre ? (Array.isArray(release.genres.genre) ? release.genres.genre : [release.genres.genre]) : [];
    const styles = release.styles?.style ? (Array.isArray(release.styles.style) ? release.styles.style : [release.styles.style]) : [];
    const released = release.released ? String(release.released).trim() : null;
    const dataQuality = release.dataQuality ? String(release.dataQuality).trim() : null;
    const masterId = release.masterId ? String(release.masterId).trim() : null;
    const country = release.country ? String(release.country).trim() : null;

    // Extract artists
    const artists = [];
    if (release.artists?.artist) {
      const artistArray = Array.isArray(release.artists.artist) ? release.artists.artist : [release.artists.artist];
      for (const artist of artistArray) {
        if (artist.name) {
          artists.push({ name: String(artist.name).trim() });
        }
      }
    }

    // Extract tracks
    const tracks = [];
    if (release.tracklist?.track) {
      const trackArray = Array.isArray(release.tracklist.track) ? release.tracklist.track : [release.tracklist.track];
      for (const track of trackArray) {
        if (track.title) {
          const trackArtists = [];
          if (track.artists?.artist) {
            const trackArtistArray = Array.isArray(track.artists.artist) ? track.artists.artist : [track.artists.artist];
            for (const artist of trackArtistArray) {
              if (artist.name) {
                trackArtists.push({ name: String(artist.name).trim() });
              }
            }
          }
          
          const extraArtists = [];
          if (track.extraartists?.artist) {
            const extraArtistArray = Array.isArray(track.extraartists.artist) ? track.extraartists.artist : [track.extraartists.artist];
            for (const artist of extraArtistArray) {
              extraArtists.push({
                name: artist.name ? String(artist.name).trim() : null,
                role: artist.role ? String(artist.role).trim() : null,
              });
            }
          }
          
          tracks.push({
            position: track.position ? String(track.position).trim() : null,
            title: String(track.title).trim(),
            duration: track.duration ? String(track.duration).trim() : null,
            artists: trackArtists,
            extraArtists: extraArtists,
          });
        }
      }
    }

    // Extract videos
    const videos = [];
    if (release.videos?.video) {
      const videoArray = Array.isArray(release.videos.video) ? release.videos.video : [release.videos.video];
      for (const video of videoArray) {
        const youtubeId = extractYouTubeId(video.src);
        if (youtubeId) {
          videos.push({
            youtubeId: youtubeId,
            title: video.title ? String(video.title).trim() : null,
            duration: video.duration ? parseInt(video.duration) : null,
          });
        }
      }
    }

    // Check if release already exists (by title to prevent duplicates)
    let existingRelease = await prisma.discogsRelease.findFirst({
      where: { title: releaseTitle },
      select: { id: true },
    });

    let releaseUuid;
    if (existingRelease) {
      // Use existing release UUID, but still process songs
      releaseUuid = existingRelease.id;
      stats.skipped++;
    } else {
      // Prepare release data
      const releaseData = {
        title: releaseTitle,
        status: releaseStatus,
        genres: genres.length > 0 ? genres : null,
        styles: styles.length > 0 ? styles : null,
        released: released,
        dataQuality: dataQuality,
        youtubeVideos: videos.length > 0 ? videos : null,
        lastUpdated: new Date(),
      };

      const result = await prisma.discogsRelease.create({
        data: releaseData,
      });

      releaseUuid = result.id;
      stats.created++;
    }

    // Process release artists
    const releaseArtistUuids = [];
    const releaseArtistNames = artists.map(a => a.name).filter(Boolean);
    
    for (const artist of artists) {
      if (!artist.name) continue;

      const artistName = String(artist.name).trim();

      let dbArtist = await prisma.discogsArtist.findUnique({
        where: { name: artistName },
        select: { id: true },
      });

      if (!dbArtist) {
        try {
          dbArtist = await prisma.discogsArtist.create({
            data: {
              name: artistName,
              lastUpdated: new Date(),
            },
            select: { id: true },
          });
        } catch (error) {
          dbArtist = await prisma.discogsArtist.findUnique({
            where: { name: artistName },
            select: { id: true },
          });
          
          if (!dbArtist) {
            if (stats.errors <= 10) {
              console.error(`Error creating/finding artist "${artistName}":`, error.message);
            }
            stats.errors++;
            continue;
          }
        }
      }

      if (dbArtist) {
        releaseArtistUuids.push(dbArtist.id);

        try {
          await prisma.discogsReleaseArtist.upsert({
            where: {
              releaseId_artistId: {
                releaseId: releaseUuid,
                artistId: dbArtist.id,
              },
            },
            update: {},
            create: {
              releaseId: releaseUuid,
              artistId: dbArtist.id,
            },
          });
        } catch (error) {
          if (stats.errors <= 10) {
            console.error(`Error linking artist "${artistName}" to release:`, error.message);
          }
          stats.errors++;
        }
      }
    }

    // Process tracks
    for (const track of tracks) {
      if (!track.title) continue;
      
      stats.tracksProcessed++;
      
      // Get artist names for this track
      const trackArtistNames = track.artists.map(a => a.name).filter(Boolean);
      const songArtistNames = trackArtistNames.length > 0 ? trackArtistNames : releaseArtistNames;
      const songArtist = songArtistNames.join(', ') || null;
      
      // Get track artist string (for comma-splitting logic)
      const trackArtistString = trackArtistNames.length > 0 
        ? trackArtistNames.join(', ')
        : releaseArtistNames.join(', ');
      
      const releaseArtistString = releaseArtistNames.join(', ');
      
      // Parse artist names: if track artist matches release artist, don't split
      let artistNamesToProcess = [];
      if (trackArtistString && trackArtistString === releaseArtistString) {
        artistNamesToProcess = [trackArtistString];
      } else if (trackArtistString) {
        artistNamesToProcess = trackArtistString.split(',').map(n => n.trim()).filter(Boolean);
      } else {
        artistNamesToProcess = releaseArtistNames;
      }
      
      // Get or create artist UUIDs for this track
      const trackArtistUuids = [];
      for (const artistName of artistNamesToProcess) {
        if (!artistName) continue;
        
        let dbArtist = await prisma.discogsArtist.findUnique({
          where: { name: artistName },
          select: { id: true },
        });
        
        if (!dbArtist) {
          try {
            dbArtist = await prisma.discogsArtist.create({
              data: {
                name: artistName,
                lastUpdated: new Date(),
              },
              select: { id: true },
            });
          } catch (error) {
            dbArtist = await prisma.discogsArtist.findUnique({
              where: { name: artistName },
              select: { id: true },
            });
            
            if (!dbArtist) {
              if (stats.errors <= 10) {
                console.error(`Error creating/finding track artist "${artistName}":`, error.message);
              }
              stats.errors++;
              continue;
            }
          }
        }
        
        if (dbArtist) {
          trackArtistUuids.push(dbArtist.id);
        }
      }
      
      // Try to match YouTube video
      let matchedVideo = null;
      if (videos.length > 0 && track.title) {
        const trackTitleLower = String(track.title).toLowerCase().trim();
        matchedVideo = videos.find(v => 
          v.title && String(v.title).toLowerCase().includes(trackTitleLower)
        ) || videos.find(v => {
          if (!v.title) return false;
          const videoTitleLower = String(v.title).toLowerCase();
          const lastPart = videoTitleLower.split(' - ').pop();
          return lastPart && trackTitleLower.includes(String(lastPart).trim());
        });
      }
      
      // Prepare song data
      const songData = {
        title: String(track.title).trim(),
        artist: songArtist,
        youtubeId: matchedVideo?.youtubeId || null,
        duration: track.duration ? parseDuration(track.duration) : null,
        releaseId: releaseUuid,
        discogsTrackPosition: track.position ? String(track.position).trim() : null,
        artistIds: trackArtistUuids.length > 0 ? trackArtistUuids : null,
        discogsExtraArtists: track.extraArtists.length > 0 ? track.extraArtists : null,
        discogsGenres: genres.length > 0 ? genres : null,
        discogsStyles: styles.length > 0 ? styles : null,
        discogsCountry: country,
        discogsReleased: released,
        discogsMasterId: masterId || null,
        discogsLastUpdated: new Date(),
      };
      
      // Try to find existing song
      let existingSong = null;
      if (songData.youtubeId) {
        existingSong = await prisma.song.findUnique({
          where: { youtubeId: songData.youtubeId },
        });
      }
      
      if (!existingSong && songArtist) {
        existingSong = await prisma.song.findFirst({
          where: {
            AND: [
              { title: songData.title },
              { artist: songArtist },
            ],
          },
        });
      }
      
      if (!existingSong && songData.releaseId && songData.discogsTrackPosition) {
        existingSong = await prisma.song.findFirst({
          where: {
            AND: [
              { releaseId: songData.releaseId },
              { discogsTrackPosition: songData.discogsTrackPosition },
            ],
          },
        });
      }
      
      // Upsert song
      try {
        if (existingSong) {
          await prisma.song.update({
            where: { id: existingSong.id },
            data: {
              title: songData.title,
              artist: songData.artist,
              youtubeId: songData.youtubeId || existingSong.youtubeId,
              duration: songData.duration || existingSong.duration,
              releaseId: songData.releaseId,
              discogsTrackPosition: songData.discogsTrackPosition,
              artistIds: songData.artistIds,
              discogsExtraArtists: songData.discogsExtraArtists,
              discogsGenres: songData.discogsGenres,
              discogsStyles: songData.discogsStyles,
              discogsCountry: songData.discogsCountry,
              discogsReleased: songData.discogsReleased,
              discogsMasterId: songData.discogsMasterId,
              discogsLastUpdated: songData.discogsLastUpdated,
            },
          });
        } else {
          await prisma.song.create({
            data: songData,
          });
        }
        stats.songsUpserted++;
      } catch (error) {
        if (stats.errors <= 10) {
          console.error(`Error upserting song "${songData.title}":`, error.message);
        }
        stats.errors++;
      }
    }

    // Increment processed counter (after successful processing)
    stats.processed++;

    // Update sync record periodically
    if (stats.processed - stats.lastSyncUpdate >= 1000) {
      await prisma.discogsDataSync.update({
        where: { dumpDate: stats.dumpDate },
        data: {
          releasesProcessed: stats.processed,
          tracksProcessed: stats.tracksProcessed,
          songsUpserted: stats.songsUpserted,
        },
      });
      stats.lastSyncUpdate = stats.processed;
    }

    const releaseProcessingTime = Date.now() - releaseStartTime;
    stats.totalProcessingTime += releaseProcessingTime;
    
    if (releaseProcessingTime > stats.slowestReleaseTime) {
      stats.slowestReleaseTime = releaseProcessingTime;
      stats.slowestReleaseTitle = releaseTitle;
    }

    if (stats.processed % 100 === 0) {
      const elapsed = (Date.now() - stats.startTime) / 1000;
      const newlyProcessed = stats.processed - stats.skipped;
      const rate = stats.processed > 0 ? stats.processed / elapsed : 0;
      const avgProcessingTime = stats.processed > 0 ? (stats.totalProcessingTime / stats.processed).toFixed(1) : '0';
      console.log(`   Total: ${stats.processed.toLocaleString()} | New: ${newlyProcessed.toLocaleString()} | Skipped: ${stats.skipped.toLocaleString()} | Created: ${stats.created.toLocaleString()} | Updated: ${stats.updated.toLocaleString()} | Tracks: ${stats.tracksProcessed.toLocaleString()} | Songs: ${stats.songsUpserted.toLocaleString()} | Errors: ${stats.errors} | Rate: ${rate.toFixed(0)}/s | Avg: ${avgProcessingTime}ms/release`);
    }
  } catch (error) {
    stats.errors++;
    if (stats.errors <= 10) {
      console.error(`Error processing release:`, error.message);
    }
  }
}

// Run if called directly
if (process.argv[1]?.includes('process-discogs-releases.js')) {
  processDiscogsReleases()
    .then(() => {
      console.log(`\n✅ Releases processing complete!\n`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default processDiscogsReleases;
