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

// Get all songs for the current user
router.get('/', async (req, res) => {
  try {
    const userId = req.session.userId;

    const songs = await prisma.song.findMany({
      where: { userId },
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
    const userId = req.session.userId;
    const { id } = req.params;

    const song = await prisma.song.findFirst({
      where: {
        id,
        userId,
      },
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

// Add a new song
router.post('/', async (req, res) => {
  try {
    const userId = req.session.userId;
    let { title, artist, youtubeId, youtubeUrl, thumbnailUrl, duration } = req.body;

    // Extract video ID from URL if provided
    if (youtubeUrl && !youtubeId) {
      youtubeId = extractVideoId(youtubeUrl);
    }

    if (!youtubeId) {
      return res.status(400).json({ error: 'YouTube ID or URL is required' });
    }

    // Check if song already exists for this user
    const existingSong = await prisma.song.findFirst({
      where: {
        userId,
        youtubeId,
      },
    });

    if (existingSong) {
      return res.status(400).json({ error: 'Song already exists in your library' });
    }

    // Fetch metadata from YouTube if not provided
    let metadata = null;
    if (!title || !artist || !duration || !thumbnailUrl) {
      metadata = await getVideoMetadata(youtubeId);
    }

    // Use provided values or fall back to metadata
    const finalTitle = title || metadata?.title || 'Untitled';
    const finalArtist = artist || metadata?.artist || null;
    const finalDuration = duration ? parseInt(duration) : (metadata?.duration || null);
    const finalThumbnail = thumbnailUrl || metadata?.thumbnailUrl || `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;

    const song = await prisma.song.create({
      data: {
        title: finalTitle,
        artist: finalArtist,
        youtubeId,
        thumbnailUrl: finalThumbnail,
        duration: finalDuration,
        userId,
      },
    });

    res.status(201).json({ song });
  } catch (error) {
    console.error('Create song error:', error);
    res.status(500).json({ error: 'Failed to create song' });
  }
});

// Update a song
router.put('/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const { title, artist, thumbnailUrl, duration } = req.body;

    const song = await prisma.song.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

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

// Delete a song
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    const song = await prisma.song.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    await prisma.song.delete({
      where: { id },
    });

    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Delete song error:', error);
    res.status(500).json({ error: 'Failed to delete song' });
  }
});

export default router;
