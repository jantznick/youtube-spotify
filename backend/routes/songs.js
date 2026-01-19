import express from 'express';
import ytdl from 'ytdl-core';
import https from 'https';
import puppeteer from 'puppeteer';
import { prisma } from '../server.js';

const router = express.Router();

// Extract video ID from YouTube URL
const extractVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

// Get YouTube video metadata using oEmbed API (more reliable than ytdl-core)
const getVideoMetadata = async (videoId) => {
  // Try oEmbed API first (more reliable)
  try {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    
    // Use native https module for fetch-like behavior
    const oEmbedData = await new Promise((resolve, reject) => {
      const url = new URL(oEmbedUrl);
      const options = {
        hostname: url.hostname,
        path: url.pathname + url.search,
        method: 'GET',
      };
      
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => { data += chunk; });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      });
      
      req.on('error', reject);
      req.end();
    });
    
    return {
      title: oEmbedData.title || null,
      artist: oEmbedData.author_name || null,
      duration: null, // oEmbed doesn't provide duration
      thumbnailUrl: oEmbedData.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  } catch (oEmbedError) {
    console.log('oEmbed failed, trying ytdl-core...', oEmbedError.message);
  }

  // Fallback to ytdl-core
  try {
    const info = await ytdl.getInfo(videoId);
    const videoDetails = info.videoDetails;
    
    return {
      title: videoDetails.title,
      artist: videoDetails.author?.name || null,
      duration: parseInt(videoDetails.lengthSeconds) || null,
      thumbnailUrl: videoDetails.thumbnails?.[videoDetails.thumbnails.length - 1]?.url || null,
    };
  } catch (error) {
    console.error('Error fetching YouTube metadata with ytdl-core:', error);
    // Return minimal metadata with thumbnail
    return {
      title: null,
      artist: null,
      duration: null,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  }
};

// Get all songs (global, accessible to all users)
router.get('/', async (req, res) => {
  try {
    const songs = await prisma.song.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ songs });
  } catch (error) {
    console.error('Get songs error:', error);
    res.status(500).json({ error: 'Failed to get songs' });
  }
});

// Get a single song
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const song = await prisma.song.findUnique({
      where: { id },
    });

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    res.json({ song });
  } catch (error) {
    console.error('Get song error:', error);
    res.status(500).json({ error: 'Failed to get song' });
  }
});


// Update a song (global update, affects all users) - requires auth
router.put('/:id', async (req, res) => {
  try {
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.session.userId;
    const { id } = req.params;
    const { title, artist, thumbnailUrl, duration } = req.body;

    // Verify song exists
    const song = await prisma.song.findUnique({
      where: { id },
    });

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Update the global song
    const updatedSong = await prisma.song.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(artist !== undefined && { artist }),
        ...(thumbnailUrl !== undefined && { thumbnailUrl }),
        ...(duration !== undefined && { duration: parseInt(duration) }),
      },
    });

    res.json({ song: updatedSong });
  } catch (error) {
    console.error('Update song error:', error);
    res.status(500).json({ error: 'Failed to update song' });
  }
});

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Search YouTube for a song and return the first non-ad video ID
async function searchYouTubeForSong(songName, artistName) {
  let browser;
  const searchStartTime = Date.now();
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Build search query
    const searchQuery = `${songName} ${artistName}`;
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    
    console.log(`[FIND-YOUTUBE] Searching YouTube for: ${searchQuery}`);
    const navigateStartTime = Date.now();
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    const navigateTime = Date.now() - navigateStartTime;
    console.log(`[FIND-YOUTUBE] Navigation completed in ${navigateTime}ms`);
    
    // Wait a bit for results to load
    await wait(2000);
    
    // Extract the first video ID (skip ads)
    const extractStartTime = Date.now();
    const videoId = await page.evaluate(() => {
      // Find all video links
      const videoLinks = document.querySelectorAll('a[href*="/watch?v="]');
      
      for (const link of videoLinks) {
        const href = link.getAttribute('href');
        if (href) {
          const match = href.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
          if (match) {
            const videoId = match[1];
            // Skip YouTube Shorts and ads (they usually have different patterns)
            // Check if it's a regular video by looking at the parent structure
            const container = link.closest('ytd-video-renderer, ytd-rich-item-renderer');
            if (container && !container.querySelector('ytd-ad-slot-renderer')) {
              return videoId;
            }
          }
        }
      }
      return null;
    });
    const extractTime = Date.now() - extractStartTime;
    console.log(`[FIND-YOUTUBE] Video ID extraction completed in ${extractTime}ms`);
    
    await browser.close();
    const totalSearchTime = Date.now() - searchStartTime;
    
    if (!videoId) {
      console.warn(`[FIND-YOUTUBE] No video found for: ${searchQuery} (took ${totalSearchTime}ms)`);
      return null;
    }
    
    console.log(`[FIND-YOUTUBE] Found video ID: ${videoId} for: ${searchQuery} (total time: ${totalSearchTime}ms)`);
    return videoId;
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    const totalSearchTime = Date.now() - searchStartTime;
    console.error(`[FIND-YOUTUBE] Error searching YouTube for "${songName} ${artistName}" (took ${totalSearchTime}ms):`, error);
    return null;
  }
}

// Find YouTube video for a song and update it
router.post('/:id/find-youtube', async (req, res) => {
  const endpointStartTime = Date.now();
  try {
    const { id } = req.params;
    
    console.log(`[FIND-YOUTUBE] Request received for song ID: ${id}`);
    
    // Get the song
    const fetchStartTime = Date.now();
    const song = await prisma.song.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        artist: true,
        youtubeId: true,
      },
    });
    const fetchTime = Date.now() - fetchStartTime;
    console.log(`[FIND-YOUTUBE] Song fetched in ${fetchTime}ms`);
    
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    
    // If song already has youtubeId, return it
    if (song.youtubeId) {
      const totalTime = Date.now() - endpointStartTime;
      console.log(`[FIND-YOUTUBE] Song already has youtubeId: ${song.youtubeId} (total time: ${totalTime}ms)`);
      return res.json({ 
        song: {
          ...song,
          youtubeId: song.youtubeId,
        },
        alreadyHadYoutubeId: true,
      });
    }
    
    // Check if we have title and artist
    if (!song.title) {
      return res.status(400).json({ error: 'Song must have a title to search YouTube' });
    }
    
    const artistName = song.artist || 'Unknown Artist';
    const searchQuery = `${song.title} ${artistName}`;
    
    console.log(`[FIND-YOUTUBE] Starting YouTube search for: "${song.title}" by ${artistName}`);
    
    // Search YouTube
    const searchStartTime = Date.now();
    const videoId = await searchYouTubeForSong(song.title, artistName);
    const searchTime = Date.now() - searchStartTime;
    
    if (!videoId) {
      const totalTime = Date.now() - endpointStartTime;
      console.log(`[FIND-YOUTUBE] No YouTube video found (total time: ${totalTime}ms)`);
      return res.json({ 
        song: {
          ...song,
          youtubeId: null,
        },
        found: false,
        message: 'No YouTube video found for this song',
      });
    }
    
    // Get video metadata
    const metadataStartTime = Date.now();
    const metadata = await getVideoMetadata(videoId);
    const metadataTime = Date.now() - metadataStartTime;
    console.log(`[FIND-YOUTUBE] Metadata fetched in ${metadataTime}ms`);
    
    // Update song with youtubeId and metadata
    const updateStartTime = Date.now();
    const updatedSong = await prisma.song.update({
      where: { id },
      data: {
        youtubeId: videoId,
        thumbnailUrl: metadata?.thumbnailUrl || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        duration: metadata?.duration || song.duration || null,
        // Optionally update title/artist if metadata is better, but don't overwrite existing
        ...(metadata?.title && !song.title && { title: metadata.title }),
        ...(metadata?.artist && !song.artist && { artist: metadata.artist }),
      },
    });
    const updateTime = Date.now() - updateStartTime;
    console.log(`[FIND-YOUTUBE] Song updated in ${updateTime}ms`);
    
    const totalTime = Date.now() - endpointStartTime;
    console.log(`[FIND-YOUTUBE] ✅ Successfully found and updated song "${song.title}" with youtubeId: ${videoId} (total time: ${totalTime}ms)`);
    console.log(`[FIND-YOUTUBE] Breakdown: fetch=${fetchTime}ms, search=${searchTime}ms, metadata=${metadataTime}ms, update=${updateTime}ms`);
    
    res.json({ 
      song: updatedSong,
      found: true,
    });
  } catch (error) {
    const totalTime = Date.now() - endpointStartTime;
    console.error(`[FIND-YOUTUBE] ❌ Error finding YouTube video (took ${totalTime}ms):`, error);
    res.status(500).json({ error: 'Failed to find YouTube video', details: error.message });
  }
});

// Report a video mismatch
router.post('/:id/report-mismatch', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session?.userId || null;
    const { reporterEmail, reporterName } = req.body;
    
    // Check if anonymous reports are allowed (defaults to false if env var not set)
    const allowAnonymous = (process.env.ALLOW_ANONYMOUS_VIDEO_REPORTS || 'false') === 'true';
    if (!userId && !allowAnonymous) {
      return res.status(401).json({ error: 'You must be logged in to report video mismatches' });
    }
    
    // Get the song
    const song = await prisma.song.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        artist: true,
        youtubeId: true,
      },
    });
    
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    
    if (!song.youtubeId) {
      return res.status(400).json({ error: 'Song does not have a YouTube video to report' });
    }
    
    // Check if there's already a pending report for this song
    const existingReport = await prisma.videoReport.findFirst({
      where: {
        songId: id,
        youtubeId: song.youtubeId,
        status: 'pending',
      },
    });
    
    if (existingReport) {
      return res.json({ 
        message: 'This video has already been reported',
        report: existingReport,
      });
    }
    
    // Create the report
    const report = await prisma.videoReport.create({
      data: {
        songId: id,
        youtubeId: song.youtubeId,
        reportedBy: userId,
        reporterEmail: !userId && allowAnonymous ? reporterEmail : null,
        reporterName: !userId && allowAnonymous ? reporterName : null,
        status: 'pending',
      },
    });
    
    console.log(`[VIDEO-REPORT] New report created: ${report.id} for song "${song.title}" (youtubeId: ${song.youtubeId}) by ${userId ? `user ${userId}` : 'anonymous'}`);
    
    res.json({ 
      message: 'Video mismatch reported successfully',
      report,
    });
  } catch (error) {
    console.error('[VIDEO-REPORT] Error creating report:', error);
    res.status(500).json({ error: 'Failed to report video mismatch', details: error.message });
  }
});

export default router;
