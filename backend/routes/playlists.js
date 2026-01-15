import express from 'express';
import puppeteer from 'puppeteer';
import ytdl from 'ytdl-core';
import https from 'https';
import { prisma } from '../server.js';

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const router = express.Router();

// Extract playlist ID from YouTube URL (handles both playlist URLs and video URLs with playlist params)
const extractPlaylistId = (url) => {
  // Normalize URL - add https:// if missing
  let normalizedUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    normalizedUrl = 'https://' + url;
  }
  
  // Try to extract playlist ID from various URL formats
  const patterns = [
    /[&?]list=([a-zA-Z0-9_-]+)/,  // Standard playlist parameter
    /\/playlist\?list=([a-zA-Z0-9_-]+)/,  // Playlist URL format
  ];
  
  for (const pattern of patterns) {
    const match = normalizedUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

// Detect if URL is YouTube or Spotify
const detectSourceType = (url) => {
  if (!url) return null;
  
  const normalizedUrl = url.toLowerCase();
  if (normalizedUrl.includes('youtube.com') || normalizedUrl.includes('youtu.be')) {
    return 'youtube';
  }
  if (normalizedUrl.includes('spotify.com')) {
    return 'spotify';
  }
  return null;
};

// Validate URL format
const validateSourceUrl = (url, sourceType) => {
  if (!url) return { valid: true }; // Empty URL is valid (removing source)
  
  const normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
    return { valid: false, error: 'URL must start with http:// or https://' };
  }
  
  if (sourceType === 'youtube') {
    // Check if it's a valid YouTube URL
    if (!normalizedUrl.includes('youtube.com') && !normalizedUrl.includes('youtu.be')) {
      return { valid: false, error: 'Invalid YouTube URL' };
    }
  } else if (sourceType === 'spotify') {
    // Check if it's a valid Spotify URL
    if (!normalizedUrl.includes('spotify.com')) {
      return { valid: false, error: 'Invalid Spotify URL' };
    }
  }
  
  return { valid: true };
};

// Scrape Spotify playlist using Puppeteer
async function scrapeSpotifyPlaylistWithPuppeteer(playlistUrl) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    
    // Set a reasonable viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Normalize URL
    let normalizedUrl = playlistUrl;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    // Navigate to Spotify playlist
    console.log(`Navigating to Spotify playlist: ${normalizedUrl}`);
    await page.goto(normalizedUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for playlist content to load
    await wait(3000); // Give Spotify time to load
    
    // Extract playlist title
    const playlistTitle = await page.evaluate(() => {
      const titleSelectors = [
        'h1[data-testid="entityTitle"]',
        'h1.encore-text-headline-large',
        'h1[data-encore-id="text"]',
        'h1',
        '[data-testid="playlist-title"]',
      ];
      for (const selector of titleSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          return element.textContent.trim();
        }
      }
      return null;
    });
    
    // Extract songs from the playlist - only from within the playlist-tracklist
    const songs = await page.evaluate(() => {
      const songList = [];
      
      // Find the playlist tracklist container
      const tracklistContainer = document.querySelector('[data-testid="playlist-tracklist"]');
      if (!tracklistContainer) {
        console.log('No playlist-tracklist container found');
        return songList;
      }
      
      // Find all track rows ONLY within the tracklist container
      const trackRows = tracklistContainer.querySelectorAll('[data-testid="tracklist-row"]');
      
      trackRows.forEach((row) => {
        try {
          // Get song title
          const titleElement = row.querySelector('[data-testid="internal-track-link"]');
          const title = titleElement ? titleElement.textContent.trim() : null;
          
          // Get artists - they're in links with href="/artist/..."
          const artistLinks = row.querySelectorAll('a[href^="/artist/"]');
          const artists = Array.from(artistLinks).map(link => link.textContent.trim()).filter(Boolean);
          
          if (title && artists.length > 0) {
            songList.push({
              title,
              artists: artists.join(', '),
            });
          }
        } catch (e) {
          console.error('Error extracting song:', e);
        }
      });
      
      return songList;
    });
    
    await browser.close();
    
    return {
      title: playlistTitle || 'Imported Spotify Playlist',
      songs,
    };
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Spotify scraping error:', error);
    throw error;
  }
}

// Search YouTube for a song and return the first non-ad video ID
async function searchYouTubeForSong(songName, artistName) {
  let browser;
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
    
    console.log(`Searching YouTube for: ${searchQuery}`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait a bit for results to load
    await wait(2000);
    
    // Extract the first video ID (skip ads)
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
    
    await browser.close();
    
    if (!videoId) {
      console.warn(`No video found for: ${searchQuery}`);
      return null;
    }
    
    console.log(`Found video ID: ${videoId} for: ${searchQuery}`);
    return videoId;
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error(`Error searching YouTube for "${songName} ${artistName}":`, error);
    return null;
  }
}

// Scrape YouTube playlist using Puppeteer
async function scrapePlaylistWithPuppeteer(playlistUrl) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    
    // Set a reasonable viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to playlist
    console.log(`Navigating to: ${playlistUrl}`);
    await page.goto(playlistUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for playlist content to load
    await page.waitForSelector('ytd-playlist-panel-video-renderer, ytd-playlist-video-renderer, ytd-playlist-video-list-renderer, ytd-playlist-video', { timeout: 10000 }).catch(() => {
      console.log('Playlist items selector not found, trying alternative approach...');
    });
    
    // Scroll to load more videos (if needed)
    await page.evaluate(() => {
      return new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;
          
          if (totalHeight >= scrollHeight || totalHeight > 5000) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      });
    });
    
    // Extract video IDs and playlist title
    const playlistData = await page.evaluate(() => {
      const videoIds = [];
      
      // Try multiple selectors for playlist items
      const selectors = [
        'ytd-playlist-panel-video-renderer a[href*="/watch?v="]', // For Mix/Radio playlists shown in sidebar
        'ytd-playlist-panel-video-renderer #wc-endpoint', // Alternative selector for the same
        'ytd-playlist-video-renderer a[href*="/watch?v="]', // For regular playlists
        'ytd-playlist-video-list-renderer a[href*="/watch?v="]',
        'ytd-playlist-video a[href*="/watch?v="]',
        'a[href*="/watch?v="]',
      ];
      
      for (const selector of selectors) {
        const links = document.querySelectorAll(selector);
        if (links.length > 0) {
          links.forEach((link) => {
            const href = link.getAttribute('href') || link.href;
            if (href) {
              const match = href.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
              if (match && !videoIds.includes(match[1])) {
                videoIds.push(match[1]);
              }
            }
          });
          if (videoIds.length > 0) break;
        }
      }
      
      // Get playlist title
      const titleSelectors = [
        'h1.ytd-playlist-header-renderer',
        'ytd-playlist-header-renderer h1',
        '#title',
        'ytd-playlist-header-renderer #title',
      ];
      
      let title = null;
      for (const selector of titleSelectors) {
        const titleElement = document.querySelector(selector);
        if (titleElement) {
          title = titleElement.textContent.trim();
          break;
        }
      }
      
      return { videoIds, title };
    });
    
    await browser.close();
    
    return {
      videoIds: playlistData.videoIds,
      title: playlistData.title,
    };
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('Puppeteer scraping error:', error);
    throw error;
  }
}

// Get all playlists for the current user
router.get('/', async (req, res) => {
  try {
    const userId = req.session.userId;

    const playlists = await prisma.playlist.findMany({
      where: { userId },
      include: {
        playlistSongs: {
          include: {
            song: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ playlists });
  } catch (error) {
    console.error('Get playlists error:', error);
    res.status(500).json({ error: 'Failed to get playlists' });
  }
});

// Get a single playlist
router.get('/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    const playlist = await prisma.playlist.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        playlistSongs: {
          include: {
            song: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    res.json({ playlist });
  } catch (error) {
    console.error('Get playlist error:', error);
    res.status(500).json({ error: 'Failed to get playlist' });
  }
});

// Create a new playlist
router.post('/', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Playlist name is required' });
    }

    const playlist = await prisma.playlist.create({
      data: {
        name,
        description: description || null,
        userId,
      },
    });

    res.status(201).json({ playlist });
  } catch (error) {
    console.error('Create playlist error:', error);
    res.status(500).json({ error: 'Failed to create playlist' });
  }
});

// Update a playlist
router.put('/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;
    const { name, description, autoUpdate, sourceUrl } = req.body;

    const playlist = await prisma.playlist.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Build update data object
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    
    // Handle sourceUrl update
    if (sourceUrl !== undefined) {
      if (sourceUrl === null || sourceUrl === '') {
        // Removing source URL
        updateData.sourceUrl = null;
        updateData.sourceType = null;
        // Disable autoUpdate if source is removed
        updateData.autoUpdate = false;
      } else {
        // Validate and set source URL
        const detectedType = detectSourceType(sourceUrl);
        if (!detectedType) {
          return res.status(400).json({ error: 'Invalid URL. Must be a YouTube or Spotify playlist URL.' });
        }
        
        const validation = validateSourceUrl(sourceUrl, detectedType);
        if (!validation.valid) {
          return res.status(400).json({ error: validation.error });
        }
        
        // Normalize URL
        let normalizedUrl = sourceUrl.trim();
        if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
          normalizedUrl = 'https://' + normalizedUrl;
        }
        
        updateData.sourceUrl = normalizedUrl;
        updateData.sourceType = detectedType;
      }
    }
    
    // Only allow autoUpdate to be set if playlist has a source (YouTube or Spotify)
    if (autoUpdate !== undefined) {
      if (autoUpdate && !updateData.sourceType && !playlist.sourceType) {
        return res.status(400).json({ error: 'Auto-update requires a source URL' });
      }
      if (updateData.sourceType || playlist.sourceType) {
        updateData.autoUpdate = Boolean(autoUpdate);
      }
    }

    const updatedPlaylist = await prisma.playlist.update({
      where: { id },
      data: updateData,
      include: {
        playlistSongs: {
          include: {
            song: true,
          },
          orderBy: {
            position: 'asc',
          },
        },
      },
    });

    res.json({ playlist: updatedPlaylist });
  } catch (error) {
    console.error('Update playlist error:', error);
    res.status(500).json({ error: 'Failed to update playlist' });
  }
});

// Delete a playlist
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    const playlist = await prisma.playlist.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    await prisma.playlist.delete({
      where: { id },
    });

    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Delete playlist error:', error);
    res.status(500).json({ error: 'Failed to delete playlist' });
  }
});

// Add song to playlist
router.post('/:id/songs', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id: playlistId } = req.params;
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ error: 'Song ID is required' });
    }

    // Verify playlist belongs to user
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId,
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Verify song belongs to user
    const song = await prisma.song.findFirst({
      where: {
        id: songId,
        userId,
      },
    });

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Check if song is already in playlist
    const existing = await prisma.playlistSong.findUnique({
      where: {
        playlistId_songId: {
          playlistId,
          songId,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ error: 'Song already in playlist' });
    }

    // Get the highest position in the playlist
    const lastSong = await prisma.playlistSong.findFirst({
      where: { playlistId },
      orderBy: { position: 'desc' },
    });

    const position = lastSong ? lastSong.position + 1 : 0;

    const playlistSong = await prisma.playlistSong.create({
      data: {
        playlistId,
        songId,
        position,
      },
      include: {
        song: true,
      },
    });

    res.status(201).json({ playlistSong });
  } catch (error) {
    console.error('Add song to playlist error:', error);
    res.status(500).json({ error: 'Failed to add song to playlist' });
  }
});

// Remove song from playlist
router.delete('/:id/songs/:songId', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id: playlistId, songId } = req.params;

    // Verify playlist belongs to user
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId,
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    const playlistSong = await prisma.playlistSong.findUnique({
      where: {
        playlistId_songId: {
          playlistId,
          songId,
        },
      },
    });

    if (!playlistSong) {
      return res.status(404).json({ error: 'Song not found in playlist' });
    }

    await prisma.playlistSong.delete({
      where: {
        playlistId_songId: {
          playlistId,
          songId,
        },
      },
    });

    res.json({ message: 'Song removed from playlist' });
  } catch (error) {
    console.error('Remove song from playlist error:', error);
    res.status(500).json({ error: 'Failed to remove song from playlist' });
  }
});

// Reorder songs in playlist
router.put('/:id/songs/reorder', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id: playlistId } = req.params;
    const { songIds } = req.body; // Array of song IDs in new order

    if (!Array.isArray(songIds)) {
      return res.status(400).json({ error: 'songIds must be an array' });
    }

    // Verify playlist belongs to user
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        userId,
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Update positions
    await Promise.all(
      songIds.map((songId, index) =>
        prisma.playlistSong.updateMany({
          where: {
            playlistId,
            songId,
          },
          data: {
            position: index,
          },
        })
      )
    );

    res.json({ message: 'Playlist reordered successfully' });
  } catch (error) {
    console.error('Reorder playlist error:', error);
    res.status(500).json({ error: 'Failed to reorder playlist' });
  }
});

// Import Spotify playlist (async - returns immediately, processes in background)
router.post('/import-spotify', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { spotifyUrl, playlistName } = req.body;

    if (!spotifyUrl) {
      return res.status(400).json({ error: 'Spotify playlist URL is required' });
    }

    // Start async import process (don't await)
    importSpotifyPlaylistAsync(userId, spotifyUrl, playlistName).catch((error) => {
      console.error('Background Spotify playlist import error:', error);
    });

    // Return immediately
    res.status(202).json({
      message: 'Spotify playlist import started. Songs will be added in the background.',
    });
  } catch (error) {
    console.error('Import Spotify playlist error:', error);
    res.status(500).json({ error: 'Failed to start Spotify playlist import' });
  }
});

// Import YouTube playlist (async - returns immediately, processes in background)
router.post('/import-youtube', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { youtubeUrl, playlistName } = req.body;

    if (!youtubeUrl) {
      return res.status(400).json({ error: 'YouTube playlist URL is required' });
    }

    // Extract playlist ID
    const playlistId = extractPlaylistId(youtubeUrl);
    if (!playlistId) {
      return res.status(400).json({ error: 'Invalid YouTube playlist URL' });
    }

    // Start async import process (don't await)
    importPlaylistAsync(userId, playlistId, playlistName, youtubeUrl).catch((error) => {
      console.error('Background playlist import error:', error);
    });

    // Return immediately
    res.status(202).json({
      message: 'Playlist import started. Songs will be added in the background.',
      playlistId: playlistId,
    });
  } catch (error) {
    console.error('Import playlist error:', error);
    res.status(500).json({ error: 'Failed to start playlist import' });
  }
});

// Refresh playlist from source URL
router.post('/:id/refresh', async (req, res) => {
  try {
    const userId = req.session.userId;
    const { id } = req.params;

    // Get playlist
    const playlist = await prisma.playlist.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found' });
    }

    if (!playlist.sourceUrl || !playlist.sourceType) {
      return res.status(400).json({ error: 'Playlist does not have a source URL to refresh from' });
    }

    // Start refresh process based on source type
    if (playlist.sourceType === 'youtube') {
      const playlistId = extractPlaylistId(playlist.sourceUrl);
      if (!playlistId) {
        return res.status(400).json({ error: 'Invalid YouTube playlist URL' });
      }
      
      // Start async refresh (don't await)
      refreshYouTubePlaylistAsync(id, userId, playlistId, playlist.sourceUrl).catch((error) => {
        console.error('Background playlist refresh error:', error);
      });
    } else if (playlist.sourceType === 'spotify') {
      // Start async refresh (don't await)
      refreshSpotifyPlaylistAsync(id, userId, playlist.sourceUrl).catch((error) => {
        console.error('Background playlist refresh error:', error);
      });
    } else {
      return res.status(400).json({ error: 'Unsupported source type' });
    }

    // Update the playlist's lastSyncedAt timestamp
    await prisma.playlist.update({
      where: { id },
      data: { lastSyncedAt: new Date() },
    });

    res.status(202).json({
      message: 'Playlist refresh started. Songs will be updated in the background.',
    });
  } catch (error) {
    console.error('Refresh playlist error:', error);
    res.status(500).json({ error: 'Failed to start playlist refresh' });
  }
});

// Helper function to get video metadata
async function getVideoMetadata(videoId) {
  // Try oEmbed API first
  try {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
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
      duration: null,
      thumbnailUrl: oEmbedData.thumbnail_url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
  } catch (oEmbedError) {
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
    } catch (ytdlError) {
      console.error(`Error fetching metadata for video ${videoId}:`, ytdlError);
      return {
        title: null,
        artist: null,
        duration: null,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      };
    }
  }
}

// Async function to import playlist in background
async function importPlaylistAsync(userId, playlistId, playlistName, youtubeUrl) {
  try {
    // Extract video ID from original URL as fallback
    const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const fallbackVideoId = videoIdMatch ? videoIdMatch[1] : null;
    
    // Check if this is a Mix/Radio playlist (starts with "RD")
    // Mix playlists show the playlist panel on the video page, not the playlist page
    const isMixPlaylist = playlistId.startsWith('RD');
    
    let playlistData;
    
    // For Mix playlists, use the original video URL directly
    if (isMixPlaylist && youtubeUrl && (youtubeUrl.includes('watch?v=') || youtubeUrl.includes('youtu.be/'))) {
      console.log('Detected Mix/Radio playlist, using original video URL');
      try {
        // Normalize the video URL
        let normalizedVideoUrl = youtubeUrl;
        if (!normalizedVideoUrl.startsWith('http://') && !normalizedVideoUrl.startsWith('https://')) {
          normalizedVideoUrl = 'https://' + normalizedVideoUrl;
        }
        playlistData = await scrapePlaylistWithPuppeteer(normalizedVideoUrl);
      } catch (videoError) {
        console.error('Error scraping Mix playlist from video URL:', videoError);
        // Fallback: create playlist with just the video from URL
        if (fallbackVideoId) {
          console.log('Creating playlist with single video as fallback');
          playlistData = {
            videoIds: [fallbackVideoId],
            title: null,
          };
        } else {
          throw new Error('Could not extract playlist or video information');
        }
      }
    } else {
      // For regular playlists, try the playlist URL first
      let playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
      try {
        playlistData = await scrapePlaylistWithPuppeteer(playlistUrl);
      } catch (error) {
        console.error('Error scraping playlist URL, trying with original URL:', error);
        // If playlist URL fails and we have a video URL, try scraping that
        if (youtubeUrl && (youtubeUrl.includes('watch?v=') || youtubeUrl.includes('youtu.be/'))) {
          try {
            // Normalize the video URL
            let normalizedVideoUrl = youtubeUrl;
            if (!normalizedVideoUrl.startsWith('http://') && !normalizedVideoUrl.startsWith('https://')) {
              normalizedVideoUrl = 'https://' + normalizedVideoUrl;
            }
            playlistData = await scrapePlaylistWithPuppeteer(normalizedVideoUrl);
          } catch (videoError) {
            console.error('Error scraping video URL:', videoError);
            // Last resort: create playlist with just the video from URL
            if (fallbackVideoId) {
              console.log('Creating playlist with single video as fallback');
              playlistData = {
                videoIds: [fallbackVideoId],
                title: null,
              };
            } else {
              throw new Error('Could not extract playlist or video information');
            }
          }
        } else if (fallbackVideoId) {
          playlistData = {
            videoIds: [fallbackVideoId],
            title: null,
          };
        } else {
          throw new Error('Could not extract playlist or video information');
        }
      }
    }
    
    const videoIds = playlistData.videoIds || [];
    if (videoIds.length === 0) {
      console.error('No videos found in playlist');
      return;
    }
    
    // Get playlist title if available
    let finalPlaylistName = (playlistName && playlistName.trim()) || playlistData.title || 'Imported Playlist';
    finalPlaylistName = finalPlaylistName.trim();
    // Append "- YouTube" if not already present (case-insensitive check)
    const lowerName = finalPlaylistName.toLowerCase();
    if (!lowerName.endsWith('- youtube') && !lowerName.endsWith(' - youtube')) {
      finalPlaylistName = `${finalPlaylistName} - YouTube`;
    }
    
    // Normalize the YouTube URL for storage
    let normalizedYoutubeUrl = youtubeUrl;
    if (!normalizedYoutubeUrl.startsWith('http://') && !normalizedYoutubeUrl.startsWith('https://')) {
      normalizedYoutubeUrl = 'https://' + normalizedYoutubeUrl;
    }
    
    // Create playlist with source URL
    const playlist = await prisma.playlist.create({
      data: {
        name: finalPlaylistName,
        description: `Imported from YouTube playlist`,
        sourceUrl: normalizedYoutubeUrl,
        sourceType: 'youtube',
        autoUpdate: false,
        lastSyncedAt: new Date(),
        userId,
      },
    });

    console.log(`Starting import of ${videoIds.length} songs for playlist: ${playlist.name}`);

    // Import each video as a song and add to playlist
    for (let i = 0; i < videoIds.length; i++) {
      const videoId = videoIds[i];
      try {
        // Check if song already exists
        let song = await prisma.song.findFirst({
          where: {
            userId,
            youtubeId: videoId,
          },
        });

        // Create song if it doesn't exist
        if (!song) {
          const metadata = await getVideoMetadata(videoId);
          
          song = await prisma.song.create({
            data: {
              title: metadata?.title || 'Untitled',
              artist: metadata?.artist || null,
              youtubeId: videoId,
              thumbnailUrl: metadata?.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              duration: metadata?.duration || null,
              userId,
            },
          });
        }

        // Add song to playlist (check if already exists)
        const existing = await prisma.playlistSong.findUnique({
          where: {
            playlistId_songId: {
              playlistId: playlist.id,
              songId: song.id,
            },
          },
        });

        if (!existing) {
          await prisma.playlistSong.create({
            data: {
              playlistId: playlist.id,
              songId: song.id,
              position: i,
            },
          });
        }
      } catch (error) {
        console.error(`Error importing video ${videoId}:`, error);
      }
    }

    console.log(`Completed import of playlist: ${playlist.name}`);
  } catch (error) {
    console.error('Background playlist import error:', error);
  }
}

// Async function to refresh YouTube playlist (updates existing playlist)
async function refreshYouTubePlaylistAsync(playlistId, userId, youtubePlaylistId, youtubeUrl) {
  try {
    console.log(`Refreshing YouTube playlist: ${playlistId}`);
    
    // Extract video ID from original URL as fallback
    const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const fallbackVideoId = videoIdMatch ? videoIdMatch[1] : null;
    
    // Check if this is a Mix/Radio playlist
    const isMixPlaylist = youtubePlaylistId.startsWith('RD');
    
    let playlistData;
    
    // For Mix playlists, use the original video URL directly
    if (isMixPlaylist && youtubeUrl && (youtubeUrl.includes('watch?v=') || youtubeUrl.includes('youtu.be/'))) {
      console.log('Detected Mix/Radio playlist, using original video URL');
      try {
        let normalizedVideoUrl = youtubeUrl;
        if (!normalizedVideoUrl.startsWith('http://') && !normalizedVideoUrl.startsWith('https://')) {
          normalizedVideoUrl = 'https://' + normalizedVideoUrl;
        }
        playlistData = await scrapePlaylistWithPuppeteer(normalizedVideoUrl);
      } catch (videoError) {
        console.error('Error scraping Mix playlist from video URL:', videoError);
        if (fallbackVideoId) {
          playlistData = {
            videoIds: [fallbackVideoId],
            title: null,
          };
        } else {
          throw new Error('Could not extract playlist or video information');
        }
      }
    } else {
      // For regular playlists, try the playlist URL first
      let playlistUrl = `https://www.youtube.com/playlist?list=${youtubePlaylistId}`;
      try {
        playlistData = await scrapePlaylistWithPuppeteer(playlistUrl);
      } catch (error) {
        console.error('Error scraping playlist URL, trying with original URL:', error);
        if (youtubeUrl && (youtubeUrl.includes('watch?v=') || youtubeUrl.includes('youtu.be/'))) {
          try {
            let normalizedVideoUrl = youtubeUrl;
            if (!normalizedVideoUrl.startsWith('http://') && !normalizedVideoUrl.startsWith('https://')) {
              normalizedVideoUrl = 'https://' + normalizedVideoUrl;
            }
            playlistData = await scrapePlaylistWithPuppeteer(normalizedVideoUrl);
          } catch (videoError) {
            console.error('Error scraping video URL:', videoError);
            if (fallbackVideoId) {
              playlistData = {
                videoIds: [fallbackVideoId],
                title: null,
              };
            } else {
              throw new Error('Could not extract playlist or video information');
            }
          }
        } else if (fallbackVideoId) {
          playlistData = {
            videoIds: [fallbackVideoId],
            title: null,
          };
        } else {
          throw new Error('Could not extract playlist or video information');
        }
      }
    }
    
    const videoIds = playlistData.videoIds || [];
    if (videoIds.length === 0) {
      console.error('No videos found in playlist');
      return;
    }
    
    console.log(`Starting refresh of ${videoIds.length} songs for playlist: ${playlistId}`);

    // Import each video as a song and add to playlist
    for (let i = 0; i < videoIds.length; i++) {
      const videoId = videoIds[i];
      try {
        // Check if song already exists
        let song = await prisma.song.findFirst({
          where: {
            userId,
            youtubeId: videoId,
          },
        });

        // Create song if it doesn't exist
        if (!song) {
          const metadata = await getVideoMetadata(videoId);
          
          song = await prisma.song.create({
            data: {
              title: metadata?.title || 'Untitled',
              artist: metadata?.artist || null,
              youtubeId: videoId,
              thumbnailUrl: metadata?.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              duration: metadata?.duration || null,
              userId,
            },
          });
        }

        // Add song to playlist (check if already exists)
        const existing = await prisma.playlistSong.findUnique({
          where: {
            playlistId_songId: {
              playlistId: playlistId,
              songId: song.id,
            },
          },
        });

        if (!existing) {
          await prisma.playlistSong.create({
            data: {
              playlistId: playlistId,
              songId: song.id,
              position: i,
            },
          });
        }
      } catch (error) {
        console.error(`Error importing video ${videoId}:`, error);
      }
    }

    console.log(`Completed refresh of playlist: ${playlistId}`);
  } catch (error) {
    console.error('Background playlist refresh error:', error);
  }
}

// Async function to refresh Spotify playlist (updates existing playlist)
async function refreshSpotifyPlaylistAsync(playlistId, userId, spotifyUrl) {
  try {
    console.log(`Refreshing Spotify playlist: ${playlistId}`);
    
    // Scrape Spotify playlist
    const spotifyData = await scrapeSpotifyPlaylistWithPuppeteer(spotifyUrl);
    
    if (!spotifyData.songs || spotifyData.songs.length === 0) {
      console.error('No songs found in Spotify playlist');
      return;
    }
    
    console.log(`Starting refresh of ${spotifyData.songs.length} songs for playlist: ${playlistId}`);

    // For each song, search YouTube and add to playlist
    for (let i = 0; i < spotifyData.songs.length; i++) {
      const spotifySong = spotifyData.songs[i];
      try {
        // Search YouTube for the song
        const videoId = await searchYouTubeForSong(spotifySong.title, spotifySong.artists);
        
        if (!videoId) {
          console.warn(`Skipping "${spotifySong.title}" by ${spotifySong.artists} - no YouTube video found`);
          continue;
        }
        
        // Check if song already exists
        let song = await prisma.song.findFirst({
          where: {
            userId,
            youtubeId: videoId,
          },
        });

        // Create song if it doesn't exist
        if (!song) {
          const metadata = await getVideoMetadata(videoId);
          
          song = await prisma.song.create({
            data: {
              title: metadata?.title || spotifySong.title,
              artist: metadata?.artist || spotifySong.artists,
              youtubeId: videoId,
              thumbnailUrl: metadata?.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              duration: metadata?.duration || null,
              userId,
            },
          });
        }

        // Add song to playlist (check if already exists)
        const existing = await prisma.playlistSong.findUnique({
          where: {
            playlistId_songId: {
              playlistId: playlistId,
              songId: song.id,
            },
          },
        });

        if (!existing) {
          await prisma.playlistSong.create({
            data: {
              playlistId: playlistId,
              songId: song.id,
              position: i,
            },
          });
        }
        
        console.log(`Refreshed ${i + 1}/${spotifyData.songs.length}: ${spotifySong.title}`);
      } catch (error) {
        console.error(`Error importing song "${spotifySong.title}":`, error);
      }
    }

    console.log(`Completed refresh of Spotify playlist: ${playlistId}`);
  } catch (error) {
    console.error('Background playlist refresh error:', error);
  }
}

// Async function to import Spotify playlist in background
async function importSpotifyPlaylistAsync(userId, spotifyUrl, playlistName) {
  try {
    console.log(`Starting Spotify playlist import: ${spotifyUrl}`);
    
    // Scrape Spotify playlist
    const spotifyData = await scrapeSpotifyPlaylistWithPuppeteer(spotifyUrl);
    
    if (!spotifyData.songs || spotifyData.songs.length === 0) {
      console.error('No songs found in Spotify playlist');
      return;
    }
    
    // Get playlist title
    let finalPlaylistName = (playlistName && playlistName.trim()) || spotifyData.title || 'Imported Spotify Playlist';
    finalPlaylistName = finalPlaylistName.trim();
    // Append "- Spotify" if not already present (case-insensitive check)
    const lowerName = finalPlaylistName.toLowerCase();
    if (!lowerName.endsWith('- spotify') && !lowerName.endsWith(' - spotify')) {
      finalPlaylistName = `${finalPlaylistName} - Spotify`;
    }
    
    // Normalize the Spotify URL for storage
    let normalizedSpotifyUrl = spotifyUrl;
    if (!normalizedSpotifyUrl.startsWith('http://') && !normalizedSpotifyUrl.startsWith('https://')) {
      normalizedSpotifyUrl = 'https://' + normalizedSpotifyUrl;
    }
    
    // Create playlist with source URL
    const playlist = await prisma.playlist.create({
      data: {
        name: finalPlaylistName,
        description: `Imported from Spotify playlist`,
        sourceUrl: normalizedSpotifyUrl,
        sourceType: 'spotify',
        autoUpdate: false,
        lastSyncedAt: new Date(),
        userId,
      },
    });

    console.log(`Starting import of ${spotifyData.songs.length} songs for playlist: ${playlist.name}`);

    // For each song, search YouTube and add to playlist
    for (let i = 0; i < spotifyData.songs.length; i++) {
      const spotifySong = spotifyData.songs[i];
      try {
        // Search YouTube for the song
        const videoId = await searchYouTubeForSong(spotifySong.title, spotifySong.artists);
        
        if (!videoId) {
          console.warn(`Skipping "${spotifySong.title}" by ${spotifySong.artists} - no YouTube video found`);
          continue;
        }
        
        // Check if song already exists
        let song = await prisma.song.findFirst({
          where: {
            userId,
            youtubeId: videoId,
          },
        });

        // Create song if it doesn't exist
        if (!song) {
          const metadata = await getVideoMetadata(videoId);
          
          song = await prisma.song.create({
            data: {
              title: metadata?.title || spotifySong.title,
              artist: metadata?.artist || spotifySong.artists,
              youtubeId: videoId,
              thumbnailUrl: metadata?.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              duration: metadata?.duration || null,
              userId,
            },
          });
        }

        // Add song to playlist (check if already exists)
        const existing = await prisma.playlistSong.findUnique({
          where: {
            playlistId_songId: {
              playlistId: playlist.id,
              songId: song.id,
            },
          },
        });

        if (!existing) {
          await prisma.playlistSong.create({
            data: {
              playlistId: playlist.id,
              songId: song.id,
              position: i,
            },
          });
        }
        
        console.log(`Imported ${i + 1}/${spotifyData.songs.length}: ${spotifySong.title}`);
      } catch (error) {
        console.error(`Error importing song "${spotifySong.title}":`, error);
      }
    }

    console.log(`Completed import of Spotify playlist: ${playlist.name}`);
  } catch (error) {
    console.error('Background Spotify playlist import error:', error);
  }
}

export default router;
