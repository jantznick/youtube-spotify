import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import https from 'https';
import fs from 'fs';

const prisma = new PrismaClient();

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Extract playlist ID from YouTube URL
const extractPlaylistId = (url) => {
  let normalizedUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    normalizedUrl = 'https://' + url;
  }
  
  const patterns = [
    /[&?]list=([a-zA-Z0-9_-]+)/,
    /\/playlist\?list=([a-zA-Z0-9_-]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = normalizedUrl.match(pattern);
    if (match) {
      return match[1];
    }
  }
  
  return null;
};

// Detect source type
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

// Get video metadata from YouTube
async function getVideoMetadata(videoId) {
  try {
    return new Promise((resolve, reject) => {
      const url = `https://www.youtube.com/watch?v=${videoId}`;
      https.get(url, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const titleMatch = data.match(/<title>([^<]+)<\/title>/);
            const title = titleMatch ? titleMatch[1].replace(' - YouTube', '').trim() : null;
            
            let artist = null;
            if (title && title.includes(' - ')) {
              const parts = title.split(' - ');
              if (parts.length >= 2) {
                artist = parts[parts.length - 1].trim();
              }
            }
            
            resolve({
              title: title || 'Untitled',
              artist: artist || null,
              thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              duration: null,
            });
          } catch (error) {
            resolve({
              title: 'Untitled',
              artist: null,
              thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              duration: null,
            });
          }
        });
      }).on('error', (error) => {
        resolve({
          title: 'Untitled',
          artist: null,
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
          duration: null,
        });
      });
    });
  } catch (error) {
    return {
      title: 'Untitled',
      artist: null,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: null,
    };
  }
}

// Scrape YouTube playlist
async function scrapePlaylistWithPuppeteer(playlistUrl) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    let normalizedUrl = playlistUrl;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    console.log(`Navigating to: ${normalizedUrl}`);
    await page.goto(normalizedUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    await page.waitForSelector('ytd-playlist-panel-video-renderer, ytd-playlist-video-renderer, ytd-playlist-video-list-renderer, ytd-playlist-video', { timeout: 10000 }).catch(() => {});
    
    // Scroll to load more
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
    
    const playlistData = await page.evaluate(() => {
      const videoIds = [];
      const selectors = [
        'ytd-playlist-panel-video-renderer a[href*="/watch?v="]',
        'ytd-playlist-video-renderer a[href*="/watch?v="]',
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
          break;
        }
      }
      
      return { videoIds };
    });
    
    await browser.close();
    return playlistData;
  } catch (error) {
    if (browser) await browser.close();
    throw error;
  }
}

// Scrape Spotify playlist
async function scrapeSpotifyPlaylistWithPuppeteer(playlistUrl) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    let normalizedUrl = playlistUrl;
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    console.log(`Navigating to Spotify playlist: ${normalizedUrl}`);
    await page.goto(normalizedUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(3000);
    
    const songs = await page.evaluate(() => {
      const songList = [];
      const tracklistContainer = document.querySelector('[data-testid="playlist-tracklist"]');
      if (!tracklistContainer) return songList;
      
      const trackRows = tracklistContainer.querySelectorAll('[data-testid="tracklist-row"]');
      trackRows.forEach((row) => {
        try {
          const titleElement = row.querySelector('[data-testid="internal-track-link"]');
          const title = titleElement ? titleElement.textContent.trim() : null;
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
    return { songs };
  } catch (error) {
    if (browser) await browser.close();
    throw error;
  }
}

// Search YouTube for a song
async function searchYouTubeForSong(songName, artistName) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    
    const searchQuery = `${songName} ${artistName}`;
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;
    
    console.log(`Searching YouTube for: ${searchQuery}`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(2000);
    
    const videoId = await page.evaluate(() => {
      const videoLinks = document.querySelectorAll('a[href*="/watch?v="]');
      for (const link of videoLinks) {
        const href = link.getAttribute('href');
        if (href) {
          const match = href.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
          if (match) {
            const videoId = match[1];
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
    return videoId;
  } catch (error) {
    if (browser) await browser.close();
    return null;
  }
}

// Process a playlist URL and return song IDs
async function processPlaylistUrl(playlistUrl) {
  const sourceType = detectSourceType(playlistUrl);
  const songIds = [];
  
  if (sourceType === 'youtube') {
    const playlistId = extractPlaylistId(playlistUrl);
    if (!playlistId) {
      console.error(`Invalid YouTube playlist URL: ${playlistUrl}`);
      return { songIds: [], sourceType: null };
    }
    
    console.log(`Processing YouTube playlist: ${playlistUrl}`);
    const playlistData = await scrapePlaylistWithPuppeteer(playlistUrl);
    
    for (const videoId of playlistData.videoIds) {
      try {
        let song = await prisma.song.findUnique({
          where: { youtubeId: videoId },
        });
        
        if (!song) {
          const metadata = await getVideoMetadata(videoId);
          song = await prisma.song.create({
            data: {
              title: metadata.title,
              artist: metadata.artist,
              youtubeId: videoId,
              thumbnailUrl: metadata.thumbnailUrl,
              duration: metadata.duration,
            },
          });
        }
        
        songIds.push(song.id);
      } catch (error) {
        console.error(`Error processing video ${videoId}:`, error);
      }
    }
  } else if (sourceType === 'spotify') {
    console.log(`Processing Spotify playlist: ${playlistUrl}`);
    const spotifyData = await scrapeSpotifyPlaylistWithPuppeteer(playlistUrl);
    
    for (const spotifySong of spotifyData.songs) {
      try {
        const videoId = await searchYouTubeForSong(spotifySong.title, spotifySong.artists);
        if (!videoId) {
          console.warn(`Skipping "${spotifySong.title}" - no YouTube video found`);
          continue;
        }
        
        let song = await prisma.song.findUnique({
          where: { youtubeId: videoId },
        });
        
        if (!song) {
          const metadata = await getVideoMetadata(videoId);
          song = await prisma.song.create({
            data: {
              title: metadata.title || spotifySong.title,
              artist: metadata.artist || spotifySong.artists,
              youtubeId: videoId,
              thumbnailUrl: metadata.thumbnailUrl,
              duration: metadata.duration,
            },
          });
        }
        
        songIds.push(song.id);
      } catch (error) {
        console.error(`Error processing song "${spotifySong.title}":`, error);
      }
    }
  }
  
  return { songIds, sourceType };
}

// Main function to populate homepage feed
async function populateHomePageFeed(feedConfig) {
  try {
    console.log('Starting homepage feed population...\n');
    
    // Process each genre/playlist
    for (const feedItem of feedConfig.homePageFeed) {
      const { genre, tagline, playlistUrl } = feedItem;
      console.log(`\n📋 Processing genre: ${genre}`);
      console.log(`   Tagline: ${tagline || 'N/A'}`);
      console.log(`   Playlist: ${playlistUrl}`);
      
      const { songIds, sourceType } = await processPlaylistUrl(playlistUrl);
      
      if (songIds.length === 0) {
        console.warn(`   ⚠️  No songs found for ${genre}`);
        continue;
      }
      
      // Remove duplicates
      const uniqueSongIds = [...new Set(songIds)];
      
      // Upsert the feed entry
      await prisma.homePageFeed.upsert({
        where: { genre },
        update: {
          tagline: tagline || null,
          sourceType: sourceType || null,
          playlistUrl: playlistUrl || null,
          songs: uniqueSongIds,
          updatedAt: new Date(),
        },
        create: {
          genre,
          tagline: tagline || null,
          sourceType: sourceType || null,
          playlistUrl: playlistUrl || null,
          songs: uniqueSongIds,
        },
      });
      
      console.log(`   ✅ Genre "${genre}" populated with ${uniqueSongIds.length} songs (source: ${sourceType || 'unknown'})`);
      
      // Small delay between playlists
      await wait(2000);
    }
    
    console.log('\n✅ Homepage feed population complete!');
  } catch (error) {
    console.error('Error populating homepage feed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (process.argv[1]?.includes('populate-homepage-feed')) {
  (async () => {
    let configToUse = null;
    
    // If a config file path is provided, load it
    if (process.argv[2]) {
      try {
        const configData = fs.readFileSync(process.argv[2], 'utf8');
        configToUse = JSON.parse(configData);
      } catch (error) {
        console.error('Error loading config file:', error);
        process.exit(1);
      }
    } else {
      console.error('Usage: node scripts/populate-homepage-feed.js <config-file-path>');
      console.error('Example: node scripts/populate-homepage-feed.js scripts/homepage-feed-config.json');
      process.exit(1);
    }
    
    try {
      await populateHomePageFeed(configToUse);
      console.log('Script completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('Script failed:', error);
      process.exit(1);
    }
  })();
}

export { populateHomePageFeed, processPlaylistUrl };
