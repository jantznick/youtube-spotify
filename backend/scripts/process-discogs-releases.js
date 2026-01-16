import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import sax from 'sax';
import path from 'path';
import { fileURLToPath } from 'url';

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
    console.log(`🐛 DEBUG MODE: Only processing first 3 chunks\n`);
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

  // Stats
  // In debug mode, always start from 0 (ignore resume count)
  let processed = (isDebugMode ? 0 : (syncRecord.releasesProcessed || 0));
  let created = 0;
  let updated = 0;
  let errors = 0;
  let skipped = 0;
  let tracksProcessed = 0;
  let songsUpserted = syncRecord.songsUpserted || 0;
  const startTime = Date.now();
  
  // Timing metrics
  let totalProcessingTime = 0; // Total time spent processing releases (DB operations)
  let slowestReleaseTime = 0;
  let slowestReleaseTitle = null;

  // Current release being parsed
  let currentRelease = null;
  let currentTrack = null;
  let currentElement = null;
  let currentText = '';
  const elementStack = [];

  // Simple lock to ensure only one release is processed at a time
  // Wait for DB operation to complete before processing next release
  let isProcessing = false;
  let lastSyncUpdate = processed;
  let chunkCount = 0;
  const debugRecords = [];
  let readStream = null;

  // Create a promise that resolves when parsing is complete
  let resolveParser;
  let rejectParser;
  let debugModeCompleted = false; // Track if debug mode already showed summary
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

    if (node.name === 'release') {
      currentRelease = {
        id: node.attributes?.id || null,
        status: node.attributes?.status || null,
        title: null,
        genres: [],
        styles: [],
        released: null,
        dataQuality: null,
        artists: [],
        labels: [],
        tracks: [],
        videos: [],
        masterId: null,
        country: null,
      };
      currentText = '';
    } else if (node.name === 'track') {
      currentTrack = {
        position: null,
        title: null,
        duration: null,
        artists: [],
        extraArtists: [],
      };
      currentText = '';
    } else if (node.name === 'artist' && elementStack.includes('artists')) {
      // Main release artist
      const artist = { id: null, name: null };
      if (node.attributes?.id) {
        artist.id = node.attributes.id;
      }
      if (currentRelease) {
        currentRelease.artists.push(artist);
      }
      currentText = '';
    } else if (node.name === 'artist' && elementStack.includes('track')) {
      // Track artist
      const artist = { id: null, name: null };
      if (node.attributes?.id) {
        artist.id = node.attributes.id;
      }
      if (currentTrack) {
        currentTrack.artists.push(artist);
      }
      currentText = '';
    } else if (node.name === 'artist' && elementStack.includes('extraartists')) {
      // Extra artist (remixer, producer, etc.)
      const artist = {
        id: node.attributes?.id || null,
        name: null,
        role: node.attributes?.role || null,
        tracks: node.attributes?.tracks || null,
      };
      if (elementStack.includes('track')) {
        if (currentTrack) {
          currentTrack.extraArtists.push(artist);
        }
      } else if (currentRelease) {
        // Release-level extra artist
        if (!currentRelease.extraArtists) {
          currentRelease.extraArtists = [];
        }
        currentRelease.extraArtists.push(artist);
      }
      currentText = '';
    } else if (node.name === 'video') {
      const video = {
        src: node.attributes?.src || null,
        duration: node.attributes?.duration ? parseInt(node.attributes.duration) : null,
        title: null,
      };
      if (currentRelease) {
        currentRelease.videos.push(video);
      }
      currentText = '';
    } else {
      currentText = '';
    }
  };

  // Handle text content
  parser.ontext = (text) => {
    const parent = elementStack.length > 1 ? elementStack[elementStack.length - 2] : null;

    if (!currentRelease) return;

    if (currentElement === 'title' && parent === 'release') {
      currentRelease.title = (currentRelease.title || '') + text.trim();
    } else if (currentElement === 'genre') {
      currentRelease.genres.push(text.trim());
    } else if (currentElement === 'style') {
      currentRelease.styles.push(text.trim());
    } else if (currentElement === 'released') {
      currentRelease.released = (currentRelease.released || '') + text.trim();
    } else if (currentElement === 'data_quality') {
      currentRelease.dataQuality = (currentRelease.dataQuality || '') + text.trim();
    } else if (currentElement === 'master_id') {
      currentRelease.masterId = (currentRelease.masterId || '') + text.trim();
    } else if (currentElement === 'country') {
      currentRelease.country = (currentRelease.country || '') + text.trim();
    } else if (currentElement === 'name' && parent === 'artist' && elementStack.includes('artists')) {
      // Main release artist name
      if (currentRelease.artists.length > 0) {
        const lastArtist = currentRelease.artists[currentRelease.artists.length - 1];
        lastArtist.name = (lastArtist.name || '') + text.trim();
      }
    } else if (currentElement === 'id' && parent === 'artist' && elementStack.includes('artists')) {
      // Main release artist ID
      if (currentRelease.artists.length > 0) {
        const lastArtist = currentRelease.artists[currentRelease.artists.length - 1];
        lastArtist.id = (lastArtist.id || '') + text.trim();
      }
    } else if (currentElement === 'name' && parent === 'artist' && elementStack.includes('track')) {
      // Track artist name
      if (currentTrack && currentTrack.artists.length > 0) {
        const lastArtist = currentTrack.artists[currentTrack.artists.length - 1];
        lastArtist.name = (lastArtist.name || '') + text.trim();
      }
    } else if (currentElement === 'id' && parent === 'artist' && elementStack.includes('track')) {
      // Track artist ID
      if (currentTrack && currentTrack.artists.length > 0) {
        const lastArtist = currentTrack.artists[currentTrack.artists.length - 1];
        lastArtist.id = (lastArtist.id || '') + text.trim();
      }
    } else if (currentElement === 'name' && parent === 'artist' && elementStack.includes('extraartists')) {
      // Extra artist name
      if (elementStack.includes('track') && currentTrack && currentTrack.extraArtists.length > 0) {
        const lastArtist = currentTrack.extraArtists[currentTrack.extraArtists.length - 1];
        lastArtist.name = (lastArtist.name || '') + text.trim();
      } else if (currentRelease.extraArtists && currentRelease.extraArtists.length > 0) {
        const lastArtist = currentRelease.extraArtists[currentRelease.extraArtists.length - 1];
        lastArtist.name = (lastArtist.name || '') + text.trim();
      }
    } else if (currentElement === 'position' && parent === 'track') {
      if (currentTrack) {
        currentTrack.position = (currentTrack.position || '') + text.trim();
      }
    } else if (currentElement === 'title' && parent === 'track') {
      if (currentTrack) {
        currentTrack.title = (currentTrack.title || '') + text.trim();
      }
    } else if (currentElement === 'duration' && parent === 'track') {
      if (currentTrack) {
        currentTrack.duration = (currentTrack.duration || '') + text.trim();
      }
    } else if (currentElement === 'title' && parent === 'video') {
      if (currentRelease.videos.length > 0) {
        const lastVideo = currentRelease.videos[currentRelease.videos.length - 1];
        lastVideo.title = (lastVideo.title || '') + text.trim();
      }
    }
  };

  // Handle closing tags
  parser.onclosetag = async (tagName) => {
    const parent = elementStack.length > 1 ? elementStack[elementStack.length - 2] : null;

    if (tagName === 'track' && currentTrack) {
      // Save track to current release
      if (currentRelease) {
        currentRelease.tracks.push({ ...currentTrack });
      }
      currentTrack = null;
    } else if (tagName === 'release' && currentRelease) {
      // CRITICAL: Store ALL data from currentRelease BEFORE any async operations
      const releaseId = currentRelease.id;
      const releaseTitle = currentRelease.title?.trim();
      const releaseStatus = currentRelease.status;
      const genres = currentRelease.genres.length > 0 ? currentRelease.genres : null;
      const styles = currentRelease.styles.length > 0 ? currentRelease.styles : null;
      const released = currentRelease.released?.trim() || null;
      const dataQuality = currentRelease.dataQuality?.trim() || null;
      const masterId = currentRelease.masterId?.trim() || null;
      const country = currentRelease.country?.trim() || null;
      const artists = [...currentRelease.artists];
      const tracks = [...currentRelease.tracks];
      const videos = currentRelease.videos.map(v => ({
        youtubeId: extractYouTubeId(v.src),
        title: v.title?.trim() || null,
        duration: v.duration,
      })).filter(v => v.youtubeId); // Only include videos with valid YouTube IDs
      const extraArtists = currentRelease.extraArtists || [];

      // Clear currentRelease immediately
      currentRelease = null;

      // Validate required fields
      if (!releaseId || !releaseTitle || !releaseStatus) {
        errors++;
        console.error(`Error: Missing required fields (id: ${releaseId}, title: ${releaseTitle}, status: ${releaseStatus})`);
        return;
      }

      // Wait if another release is currently being processed
      // CRITICAL: Wait BEFORE incrementing processed to ensure sequential processing
      while (isProcessing) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Process this release immediately, waiting for DB to complete
      isProcessing = true;
      
      // Only increment processed AFTER acquiring the lock
      processed++;
      
      // Debug mode: only process first 3 releases (check after incrementing)
      if (isDebugMode && processed > 3 && !debugModeCompleted) {
        // Stop the stream in debug mode after 3 releases
        if (readStream && !readStream.destroyed) {
          readStream.destroy();
        }
        debugModeCompleted = true;
        
        // Show debug summary immediately since parser.onend might not fire
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
        const avgProcessingTime = processed > 0 ? (totalProcessingTime / processed).toFixed(1) : '0';
        const totalProcessingTimeSeconds = (totalProcessingTime / 1000).toFixed(1);
        const elapsedSeconds = parseFloat(elapsed);
        const dbTimePercentage = elapsedSeconds > 0 ? ((totalProcessingTime / 1000) / elapsedSeconds * 100).toFixed(1) : '0';
        
        console.log(`\n📊 Parser ended (debug mode).`);
        console.log(`\n🐛 DEBUG MODE: Processed ${processed} releases`);
        console.log(`   Total Time: ${elapsed}s`);
        console.log(`   DB Processing Time: ${totalProcessingTimeSeconds}s (${dbTimePercentage}% of total)`);
        console.log(`   Avg Processing Time: ${avgProcessingTime}ms per release`);
        if (slowestReleaseTitle && slowestReleaseTime > 0) {
          console.log(`   Slowest Release: "${slowestReleaseTitle}" (${slowestReleaseTime}ms)`);
        }
        console.log(`   Tracks Processed: ${tracksProcessed.toLocaleString()}`);
        console.log(`   Songs Upserted: ${songsUpserted.toLocaleString()}`);
        console.log(`   Check the database for the records listed above.\n`);
        
        // Update sync record one final time
        try {
          await prisma.discogsDataSync.update({
            where: { dumpDate },
            data: {
              releasesProcessed: processed,
              tracksProcessed: tracksProcessed,
              songsUpserted: songsUpserted,
            },
          });
        } catch (error) {
          console.error('Error updating sync record:', error);
        }
        
        await prisma.$disconnect();
        resolveParser();
        isProcessing = false;
        return;
      }
      
      const releaseStartTime = Date.now();
      try {
        // Prepare release data
          const releaseData = {
            id: releaseId,
            title: releaseTitle,
            status: releaseStatus,
            genres: genres,
            styles: styles,
            released: released,
            dataQuality: dataQuality,
            youtubeVideos: videos.length > 0 ? videos : null,
            lastUpdated: new Date(),
          };

          // Upsert release
          try {
            const result = await prisma.discogsRelease.upsert({
              where: { id: releaseData.id },
              update: {
                title: releaseData.title,
                status: releaseData.status,
                genres: releaseData.genres,
                styles: releaseData.styles,
                released: releaseData.released,
                dataQuality: releaseData.dataQuality,
                youtubeVideos: releaseData.youtubeVideos,
                lastUpdated: releaseData.lastUpdated,
              },
              create: releaseData,
            });

            const wasNew = result.createdAt.getTime() === result.updatedAt.getTime();
            if (wasNew) {
              created++;
            } else {
              updated++;
              skipped++;
            }

            // Debug mode: log first few records
            if (isDebugMode && debugRecords.length < 3) {
              const debugRecord = {
                releaseId: releaseId,
                title: releaseTitle,
                artists: artists.map(a => a.name).filter(Boolean),
                trackCount: tracks.length,
                tracks: tracks.slice(0, 3).map(t => ({
                  position: t.position,
                  title: t.title,
                  duration: t.duration,
                })),
                videos: videos.length,
              };
              debugRecords.push(debugRecord);
              console.log(`\n🐛 DEBUG: Expected record #${debugRecords.length}:`);
              console.log(`   Release ID: ${debugRecord.releaseId}`);
              console.log(`   Title: ${debugRecord.title}`);
              console.log(`   Artists: ${debugRecord.artists.join(', ')}`);
              console.log(`   Tracks: ${debugRecord.trackCount} (showing first 3)`);
              debugRecord.tracks.forEach(t => {
                console.log(`     - ${t.position}: ${t.title} (${t.duration || 'N/A'})`);
              });
              console.log(`   YouTube Videos: ${debugRecord.videos}`);
            }

            // Process release artists
            for (const artist of artists) {
              if (!artist.id || !artist.name) continue;

              const artistName = artist.name.trim();
              const artistDiscogsId = artist.id;

              // Find artist by discogsId or name
              let dbArtist = await prisma.discogsArtist.findFirst({
                where: {
                  OR: [
                    { discogsId: artistDiscogsId },
                    { name: artistName },
                  ],
                },
                select: { id: true },
              });

              // Auto-create missing artist with minimal data
              if (!dbArtist) {
                try {
                  dbArtist = await prisma.discogsArtist.create({
                    data: {
                      discogsId: artistDiscogsId,
                      name: artistName,
                      lastUpdated: new Date(),
                    },
                    select: { id: true },
                  });
                  
                  // Log auto-creation (limit to avoid spam)
                  if (created < 10 || created % 1000 === 0) {
                    console.log(`   ⚠️  Auto-created missing artist: "${artistName}" (Discogs ID: ${artistDiscogsId})`);
                  }
                } catch (error) {
                  // If creation fails (e.g., duplicate name), try to find again
                  dbArtist = await prisma.discogsArtist.findFirst({
                    where: {
                      OR: [
                        { discogsId: artistDiscogsId },
                        { name: artistName },
                      ],
                    },
                    select: { id: true },
                  });
                  
                  if (!dbArtist) {
                    if (errors < 10) {
                      console.error(`   ❌ Failed to create/find artist "${artistName}":`, error.message);
                    }
                    errors++;
                    continue; // Skip this artist relationship
                  }
                }
              }

              // Create/update release-artist relationship
              if (dbArtist) {
                try {
                  await prisma.discogsReleaseArtist.upsert({
                    where: {
                      releaseId_artistId: {
                        releaseId: releaseId,
                        artistId: dbArtist.id,
                      },
                    },
                    update: {},
                    create: {
                      releaseId: releaseId,
                      artistId: dbArtist.id,
                    },
                  });
                } catch (error) {
                  if (errors < 10) {
                    console.error(`   ❌ Failed to link artist "${artistName}" to release "${releaseTitle}":`, error.message);
                  }
                  errors++;
                }
              }
            }

            // Process tracks and create Song records
            if (isDebugMode && tracks.length > 0) {
              console.log(`   🐛 DEBUG: Processing ${tracks.length} tracks for release "${releaseTitle}"`);
            }
            
            // Log when starting track processing (for debugging hangs)
            if (tracks.length > 0 && (isDebugMode || processed <= 10)) {
              console.log(`   → Processing ${tracks.length} tracks for release #${processed}...`);
            }
            
            for (const track of tracks) {
              if (!track.title) {
                if (isDebugMode) {
                  console.log(`   🐛 DEBUG: Skipping track without title:`, track);
                }
                continue; // Skip tracks without titles
              }
              
              tracksProcessed++;
              
              // Get artist names for this track (track artists or release artists)
              const trackArtistNames = track.artists
                .filter(a => a.name)
                .map(a => a.name.trim());
              const releaseArtistNames = artists
                .filter(a => a.name)
                .map(a => a.name.trim());
              const songArtistNames = trackArtistNames.length > 0 ? trackArtistNames : releaseArtistNames;
              const songArtist = songArtistNames.join(', ') || null;
              
              // Get artist IDs for discogsArtistIds
              const trackArtistIds = track.artists
                .filter(a => a.id)
                .map(a => a.id);
              const releaseArtistIds = artists
                .filter(a => a.id)
                .map(a => a.id);
              const discogsArtistIds = trackArtistIds.length > 0 ? trackArtistIds : releaseArtistIds;
              
              // Try to match YouTube video to this track (by title similarity)
              let matchedVideo = null;
              if (videos.length > 0 && track.title) {
                const trackTitleLower = track.title.toLowerCase().trim();
                matchedVideo = videos.find(v => 
                  v.title && v.title.toLowerCase().includes(trackTitleLower)
                ) || videos.find(v => 
                  v.title && trackTitleLower.includes(v.title.toLowerCase().split(' - ').pop()?.trim() || '')
                );
              }
              
              // Prepare song data
              const songData = {
                title: track.title.trim(),
                artist: songArtist,
                youtubeId: matchedVideo?.youtubeId || null,
                duration: track.duration ? parseDuration(track.duration) : null,
                discogsReleaseId: releaseId,
                discogsTrackPosition: track.position?.trim() || null,
                discogsArtistIds: discogsArtistIds.length > 0 ? discogsArtistIds : null,
                discogsExtraArtists: track.extraArtists.length > 0 ? track.extraArtists : null,
                discogsGenres: genres,
                discogsStyles: styles,
                discogsCountry: country,
                discogsReleased: released,
                discogsMasterId: masterId || null,
                discogsLastUpdated: new Date(),
              };
              
              // Try to find existing song by youtubeId first (unique constraint)
              let existingSong = null;
              if (songData.youtubeId) {
                existingSong = await prisma.song.findUnique({
                  where: { youtubeId: songData.youtubeId },
                });
              }
              
              // If not found by youtubeId, try by title + artist
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
              
              // If not found, try by discogs fields
              if (!existingSong && songData.discogsReleaseId && songData.discogsTrackPosition) {
                existingSong = await prisma.song.findFirst({
                  where: {
                    AND: [
                      { discogsReleaseId: songData.discogsReleaseId },
                      { discogsTrackPosition: songData.discogsTrackPosition },
                    ],
                  },
                });
              }
              
              // Upsert song
              try {
                if (existingSong) {
                  // Update existing song
                  await prisma.song.update({
                    where: { id: existingSong.id },
                    data: {
                      title: songData.title,
                      artist: songData.artist,
                      youtubeId: songData.youtubeId || existingSong.youtubeId, // Don't overwrite existing YouTube ID
                      duration: songData.duration || existingSong.duration,
                      discogsReleaseId: songData.discogsReleaseId,
                      discogsTrackPosition: songData.discogsTrackPosition,
                      discogsArtistIds: songData.discogsArtistIds,
                      discogsExtraArtists: songData.discogsExtraArtists,
                      discogsGenres: songData.discogsGenres,
                      discogsStyles: songData.discogsStyles,
                      discogsCountry: songData.discogsCountry,
                      discogsReleased: songData.discogsReleased,
                      discogsMasterId: songData.discogsMasterId,
                      discogsLastUpdated: songData.discogsLastUpdated,
                    },
                  });
                  if (isDebugMode) {
                    console.log(`   🐛 DEBUG: Updated song "${songData.title}" by ${songArtist}`);
                  }
                } else {
                  // Create new song
                  await prisma.song.create({
                    data: songData,
                  });
                  if (isDebugMode) {
                    console.log(`   🐛 DEBUG: Created song "${songData.title}" by ${songArtist} (position: ${songData.discogsTrackPosition})`);
                  }
                }
                songsUpserted++;
              } catch (error) {
                console.error(`   ❌ Failed to upsert song "${songData.title}":`, error.message);
                if (isDebugMode || errors < 10) {
                  console.error(`   Full error:`, error);
                }
                errors++;
              }
            }
            
            // Log when track processing completes (for debugging hangs)
            if (tracks.length > 0 && (isDebugMode || processed <= 10)) {
              console.log(`   ✓ Completed processing ${tracks.length} tracks for release #${processed}`);
            }

          } catch (error) {
            if (errors < 10) {
              console.error(`Error upserting release "${releaseTitle}":`, error.message);
            }
            errors++;
          }

          // Log every release in debug mode or first 10 releases
          if (isDebugMode || processed <= 10) {
            console.log(`   ✓ Processed release #${processed}: "${releaseTitle}" (${tracks.length} tracks, ${artists.length} artists)`);
          }

          // Update sync record periodically (every 1000 releases)
          if (processed - lastSyncUpdate >= 1000) {
            await prisma.discogsDataSync.update({
              where: { dumpDate },
              data: {
                releasesProcessed: processed,
                tracksProcessed: tracksProcessed,
                songsUpserted: songsUpserted,
              },
            });
            lastSyncUpdate = processed;
          }

          // Log progress every 100 releases
          if (processed % 100 === 0) {
            const elapsed = (Date.now() - startTime) / 1000;
            const newlyProcessed = processed - skipped;
            const rate = newlyProcessed > 0 ? newlyProcessed / elapsed : 0;
            const releaseProcessingTime = (Date.now() - releaseStartTime);
            totalProcessingTime += releaseProcessingTime;
            
            // Track slowest release
            if (releaseProcessingTime > slowestReleaseTime) {
              slowestReleaseTime = releaseProcessingTime;
              slowestReleaseTitle = releaseTitle;
            }
            
            const avgProcessingTime = processed > 0 ? (totalProcessingTime / processed).toFixed(1) : '0';
            console.log(`   Total: ${processed.toLocaleString()} | New: ${newlyProcessed.toLocaleString()} | Skipped: ${skipped.toLocaleString()} | Created: ${created.toLocaleString()} | Updated: ${updated.toLocaleString()} | Tracks: ${tracksProcessed.toLocaleString()} | Songs: ${songsUpserted.toLocaleString()} | Errors: ${errors} | Rate: ${rate.toFixed(0)}/s | Avg: ${avgProcessingTime}ms/release`);
          } else {
            // Still track timing even if not logging
            const releaseProcessingTime = (Date.now() - releaseStartTime);
            totalProcessingTime += releaseProcessingTime;
            
            // Track slowest release
            if (releaseProcessingTime > slowestReleaseTime) {
              slowestReleaseTime = releaseProcessingTime;
              slowestReleaseTitle = releaseTitle;
            }
          }
      } catch (error) {
        const errorTitle = releaseTitle || releaseId || 'unknown';
        console.error(`Error processing release "${errorTitle}":`, error.message);
        if (errors < 10) {
          console.error(`   Full error:`, error);
        }
        errors++;
      } finally {
        const releaseProcessingTime = (Date.now() - releaseStartTime);
        totalProcessingTime += releaseProcessingTime;
        isProcessing = false;
      }

      return;
    }

    elementStack.pop();
    currentElement = elementStack.length > 0 ? elementStack[elementStack.length - 1] : null;
  };

  // Process remaining batch
  parser.onend = async () => {
    try {
      console.log(`\n📊 Parser ended.`);
      console.log(`   Waiting for final release to finish processing...`);

      // Wait for any in-flight release to finish processing
      while (isProcessing) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`   Processed so far: ${processed}`);

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      
      if (isDebugMode && !debugModeCompleted) {
        // Only show summary if we haven't already shown it (in case parser.onend fires after manual completion)
        debugModeCompleted = true;
        const avgProcessingTime = processed > 0 ? (totalProcessingTime / processed).toFixed(1) : '0';
        const totalProcessingTimeSeconds = (totalProcessingTime / 1000).toFixed(1);
        const elapsedSeconds = parseFloat(elapsed);
        const dbTimePercentage = elapsedSeconds > 0 ? ((totalProcessingTime / 1000) / elapsedSeconds * 100).toFixed(1) : '0';
        
        console.log(`\n🐛 DEBUG MODE: Processed ${processed} releases`);
        console.log(`   Total Time: ${elapsed}s`);
        console.log(`   DB Processing Time: ${totalProcessingTimeSeconds}s (${dbTimePercentage}% of total)`);
        console.log(`   Avg Processing Time: ${avgProcessingTime}ms per release`);
        if (slowestReleaseTitle && slowestReleaseTime > 0) {
          console.log(`   Slowest Release: "${slowestReleaseTitle}" (${slowestReleaseTime}ms)`);
        }
        console.log(`   Tracks Processed: ${tracksProcessed.toLocaleString()}`);
        console.log(`   Songs Upserted: ${songsUpserted.toLocaleString()}`);
        console.log(`   Check the database for the records listed above.\n`);
        await prisma.$disconnect();
        resolveParser();
        return;
      }

      const newlyProcessed = processed - skipped;
      const rate = processed > 0 ? (processed / parseFloat(elapsed)).toFixed(0) : '0';

      const avgProcessingTime = processed > 0 ? (totalProcessingTime / processed).toFixed(1) : '0';
      const totalProcessingTimeSeconds = (totalProcessingTime / 1000).toFixed(1);
      const elapsedSeconds = parseFloat(elapsed);
      const dbTimePercentage = elapsedSeconds > 0 ? ((totalProcessingTime / 1000) / elapsedSeconds * 100).toFixed(1) : '0';
      
      console.log(`\n✅ Processing complete!`);
      console.log(`   Total Releases in XML: ${processed.toLocaleString()}`);
      console.log(`   Skipped (already in DB): ${skipped.toLocaleString()}`);
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
      resolveParser();
    } catch (error) {
      await prisma.$disconnect();
      rejectParser(error);
    }
  };

  // Start processing
  console.log(`🚀 Starting XML stream processing...\n`);
  console.log(`   Reading from: ${xmlPath}\n`);

  readStream = fs.createReadStream(xmlPath);

  readStream.on('error', (err) => {
    console.error('❌ Stream error:', err);
    rejectParser(err);
  });

  readStream.on('data', (chunk) => {
    chunkCount++;
    // In debug mode, we'll stop after processing 3 releases, not 3 chunks
  });

  readStream.on('end', () => {
    if (!isDebugMode) {
      console.log(`   Stream ended after ${chunkCount} chunks`);
    }
  });

  parser.on('ready', () => {
    console.log('   Parser ready, starting to parse...\n');
  });

  readStream.pipe(parser);

  // Wait for parser to complete
  return parserPromise;
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

export { processDiscogsReleases };
