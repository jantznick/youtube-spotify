import express from 'express';
import { prisma } from '../server.js';
import { processPlaylistUrl } from '../scripts/populate-homepage-feed.js';

const router = express.Router();

// Log all admin route requests
router.use((req, res, next) => {
  console.log('[ADMIN ROUTE]', req.method, req.path, 'Session:', req.session?.userId || 'none');
  next();
});

// Get all homepage feed entries
router.get('/feed', async (req, res) => {
  try {
    console.log('[ADMIN] Getting feed entries');
    const feedEntries = await prisma.homePageFeed.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });
    console.log('[ADMIN] Found', feedEntries.length, 'feed entries');
    
    // Debug: Check if song IDs are valid and have youtubeId
    const feedEntriesWithDebug = await Promise.all(
      feedEntries.map(async (entry) => {
        const songIds = Array.isArray(entry.songs) ? entry.songs : [];
        const songs = songIds.length > 0 ? await prisma.song.findMany({
          where: { id: { in: songIds } },
          select: {
            id: true,
            youtubeId: true,
            title: true,
            artist: true,
          },
        }) : [];
        
        const missingSongs = songIds.filter(id => !songs.find(s => s.id === id));
        const songsWithoutYoutubeId = songs.filter(s => !s.youtubeId);
        
        return {
          ...entry,
          debug: {
            totalSongIds: songIds.length,
            foundSongs: songs.length,
            missingSongs: missingSongs.length,
            songsWithoutYoutubeId: songsWithoutYoutubeId.length,
            sampleSongIds: songIds.slice(0, 3),
            sampleSongs: songs.slice(0, 3).map(s => ({
              id: s.id,
              youtubeId: s.youtubeId,
              title: s.title,
            })),
            songsWithoutYoutubeIdSample: songsWithoutYoutubeId.slice(0, 3),
          },
        };
      })
    );
    
    res.json({ feedEntries: feedEntriesWithDebug });
  } catch (error) {
    console.error('[ADMIN] Get feed entries error:', error);
    res.status(500).json({ error: 'Failed to get feed entries' });
  }
});

// Create or update homepage feed entry
router.post('/feed', async (req, res) => {
  try {
    const { genre, tagline, playlistUrl } = req.body;

    if (!genre || !playlistUrl) {
      return res.status(400).json({ error: 'Genre and playlistUrl are required' });
    }

    // Detect source type immediately (no scraping needed)
    const detectSourceType = (url) => {
      if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
      if (url.includes('spotify.com')) return 'spotify';
      return null;
    };
    const sourceType = detectSourceType(playlistUrl);

    // Create/update the feed entry immediately with empty songs array
    // The songs will be populated in the background
    const feedEntry = await prisma.homePageFeed.upsert({
      where: { genre },
      update: {
        tagline: tagline || null,
        sourceType: sourceType || null,
        playlistUrl: playlistUrl || null,
        songs: [], // Will be populated in background
        updatedAt: new Date(),
      },
      create: {
        genre,
        tagline: tagline || null,
        sourceType: sourceType || null,
        playlistUrl: playlistUrl || null,
        songs: [], // Will be populated in background
      },
    });

    // Process the playlist URL in the background
    processPlaylistUrl(playlistUrl)
      .then(({ songIds, sourceType: detectedSourceType }) => {
        if (songIds.length > 0) {
          const uniqueSongIds = [...new Set(songIds)];
          return prisma.homePageFeed.update({
            where: { genre },
            data: {
              songs: uniqueSongIds,
              sourceType: detectedSourceType || sourceType,
              updatedAt: new Date(),
            },
          });
        }
      })
      .catch((error) => {
        console.error(`[ADMIN] Background processing error for "${genre}":`, error);
      });

    // Return immediately with success message
    res.json({ 
      feedEntry,
      message: 'Feed entry created. Playlist is being processed in the background and will update shortly.',
    });
  } catch (error) {
    console.error('Create/update feed entry error:', error);
    res.status(500).json({ error: 'Failed to create/update feed entry' });
  }
});

// Delete homepage feed entry
router.delete('/feed/:genre', async (req, res) => {
  try {
    const { genre } = req.params;

    await prisma.homePageFeed.delete({
      where: { genre },
    });

    res.json({ message: 'Feed entry deleted' });
  } catch (error) {
    console.error('Delete feed entry error:', error);
    res.status(500).json({ error: 'Failed to delete feed entry' });
  }
});

// Refresh a feed entry (re-scrape the playlist)
router.post('/feed/:genre/refresh', async (req, res) => {
  try {
    const { genre } = req.params;

    const feedEntry = await prisma.homePageFeed.findUnique({
      where: { genre },
    });

    if (!feedEntry || !feedEntry.playlistUrl) {
      return res.status(404).json({ error: 'Feed entry not found or no playlist URL' });
    }

    // Process the playlist URL in the background
    processPlaylistUrl(feedEntry.playlistUrl)
      .then(({ songIds, sourceType }) => {
        if (songIds.length > 0) {
          const uniqueSongIds = [...new Set(songIds)];
          return prisma.homePageFeed.update({
            where: { genre },
            data: {
              songs: uniqueSongIds,
              sourceType: sourceType || feedEntry.sourceType,
              updatedAt: new Date(),
            },
          });
        }
      })
      .catch((error) => {
        console.error(`[ADMIN] Background refresh error for "${genre}":`, error);
      });

    // Return immediately with success message
    res.json({ 
      feedEntry,
      message: 'Refresh started. Playlist is being processed in the background and will update shortly.',
    });
  } catch (error) {
    console.error('Refresh feed entry error:', error);
    res.status(500).json({ error: 'Failed to refresh feed entry' });
  }
});

// Bulk populate from config (for running the script via API)
router.post('/feed/populate', async (req, res) => {
  try {
    const { homePageFeed } = req.body;

    if (!homePageFeed || !Array.isArray(homePageFeed)) {
      return res.status(400).json({ error: 'homePageFeed array is required' });
    }

    // Import and start async population (don't await, return immediately)
    const { populateHomePageFeed } = await import('../scripts/populate-homepage-feed.js');
    populateHomePageFeed({ homePageFeed }).catch((error) => {
      console.error('Background feed population error:', error);
    });

    res.json({ message: 'Feed population started in background' });
  } catch (error) {
    console.error('Populate feed error:', error);
    res.status(500).json({ error: 'Failed to start feed population' });
  }
});

export default router;
