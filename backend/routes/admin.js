import express from 'express';
import { prisma } from '../server.js';
import { processPlaylistUrl } from '../scripts/populate-homepage-feed.js';
import { sendVideoReportResolvedEmail } from '../services/emailService.js';

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

    // Process the playlist URL in the background (will update incrementally)
    processPlaylistUrl(playlistUrl, genre)
      .then(({ songIds, sourceType: detectedSourceType }) => {
        if (songIds.length > 0) {
          // Final update with sourceType (songs already updated incrementally)
          return prisma.homePageFeed.update({
            where: { genre },
            data: {
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

// Update homepage feed entry (genre and tagline)
router.put('/feed/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const { genre: newGenre, tagline } = req.body;

    if (!newGenre) {
      return res.status(400).json({ error: 'Genre is required' });
    }

    // If genre is changing, we need to handle it carefully
    if (newGenre !== genre) {
      // Check if new genre already exists
      const existing = await prisma.homePageFeed.findUnique({
        where: { genre: newGenre },
      });
      if (existing) {
        return res.status(400).json({ error: 'Genre already exists' });
      }
    }

    const feedEntry = await prisma.homePageFeed.update({
      where: { genre },
      data: {
        genre: newGenre,
        tagline: tagline || null,
        updatedAt: new Date(),
      },
    });

    res.json({ feedEntry, message: 'Feed entry updated successfully' });
  } catch (error) {
    console.error('Update feed entry error:', error);
    res.status(500).json({ error: 'Failed to update feed entry' });
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

    // Process the playlist URL in the background (will update incrementally)
    // First clear the songs array
    await prisma.homePageFeed.update({
      where: { genre },
      data: {
        songs: [],
      },
    });
    
    processPlaylistUrl(feedEntry.playlistUrl, genre)
      .then(({ songIds, sourceType }) => {
        if (songIds.length > 0) {
          // Final update with sourceType (songs already updated incrementally)
          return prisma.homePageFeed.update({
            where: { genre },
            data: {
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

// Get all video reports
router.get('/video-reports', async (req, res) => {
  try {
    const reports = await prisma.videoReport.findMany({
      select: {
        id: true,
        songId: true,
        youtubeId: true, // The reported (incorrect) YouTube ID
        newYoutubeId: true, // The new YouTube ID if replaced
        reportedBy: true,
        reporterEmail: true,
        reporterName: true,
        status: true,
        resolvedBy: true,
        resolvedAt: true,
        resolutionNote: true,
        createdAt: true,
        updatedAt: true,
        Song: {
          select: {
            id: true,
            title: true,
            artist: true,
            youtubeId: true, // Current youtubeId in the song (may have changed)
            thumbnailUrl: true,
          },
        },
        Reporter: {
          select: {
            email: true,
            username: true,
          },
        },
        Resolver: {
          select: {
            email: true,
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    res.json({ reports });
  } catch (error) {
    console.error('[ADMIN] Get video reports error:', error);
    res.status(500).json({ error: 'Failed to get video reports' });
  }
});

// Resolve a video report (remove youtubeId and optionally set new one)
router.post('/video-reports/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;
    const { newYoutubeId, resolutionNote } = req.body;
    const adminUserId = req.session?.userId;
    
    if (!adminUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get the report
    const report = await prisma.videoReport.findUnique({
      where: { id },
      include: {
        Song: true,
      },
    });
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    if (report.status !== 'pending') {
      return res.status(400).json({ error: 'Report is not pending' });
    }
    
    // Get user email if report was made by a logged-in user
    let userEmail = null;
    let username = null;
    if (report.reportedBy) {
      const user = await prisma.user.findUnique({
        where: { id: report.reportedBy },
        select: { email: true, username: true },
      });
      if (user) {
        userEmail = user.email;
        username = user.username;
      }
    } else if (report.reporterEmail) {
      // Anonymous reporter provided email
      userEmail = report.reporterEmail;
      username = report.reporterName || null;
    }
    
    // Update the song - remove old youtubeId, set new one if provided
    const updateData = {
      youtubeId: newYoutubeId || null,
      thumbnailUrl: newYoutubeId ? `https://i.ytimg.com/vi/${newYoutubeId}/hqdefault.jpg` : null,
    };
    
    await prisma.song.update({
      where: { id: report.songId },
      data: updateData,
    });
    
    // Update the report status
    const updatedReport = await prisma.videoReport.update({
      where: { id },
      data: {
        status: 'resolved',
        resolvedBy: adminUserId,
        resolvedAt: new Date(),
        newYoutubeId: newYoutubeId || null,
        resolutionNote: resolutionNote || null,
      },
    });
    
    console.log(`[ADMIN] Video report ${id} resolved. ${newYoutubeId ? `Replaced youtubeId with ${newYoutubeId}` : 'Removed youtubeId'} from song "${report.Song.title}"`);
    
    // Send email notification if user has an email and a new YouTube ID was set
    if (userEmail && newYoutubeId) {
      try {
        await sendVideoReportResolvedEmail(
          userEmail,
          username,
          report.Song.title,
          report.Song.artist,
          report.youtubeId,
          newYoutubeId
        );
        console.log(`[ADMIN] Email notification sent to ${userEmail} for resolved report ${id}`);
      } catch (emailError) {
        console.error(`[ADMIN] Failed to send email notification for report ${id}:`, emailError);
        // Don't fail the request if email fails
      }
    }
    
    res.json({ 
      message: newYoutubeId ? 'Report resolved and new video ID set' : 'Report resolved and video ID removed',
      report: updatedReport,
    });
  } catch (error) {
    console.error('[ADMIN] Resolve video report error:', error);
    res.status(500).json({ error: 'Failed to resolve video report', details: error.message });
  }
});

// Dismiss a video report (mark as dismissed without action)
router.post('/video-reports/:id/dismiss', async (req, res) => {
  try {
    const { id } = req.params;
    const adminUserId = req.session?.userId;
    
    if (!adminUserId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const report = await prisma.videoReport.findUnique({
      where: { id },
    });
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    await prisma.videoReport.update({
      where: { id },
      data: {
        status: 'dismissed',
        resolvedBy: adminUserId,
        resolvedAt: new Date(),
      },
    });
    
    res.json({ message: 'Report dismissed successfully' });
  } catch (error) {
    console.error('[ADMIN] Dismiss video report error:', error);
    res.status(500).json({ error: 'Failed to dismiss video report', details: error.message });
  }
});

export default router;
