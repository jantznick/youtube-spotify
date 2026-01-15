import express from 'express';
import ytdl from 'ytdl-core';
import https from 'https';
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


export default router;
