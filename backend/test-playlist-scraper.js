import puppeteer from 'puppeteer';

// Helper function to wait
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scrapePlaylistWithPuppeteer(playlistUrl) {
  let browser;
  try {
    console.log('Launching browser...');
    browser = await puppeteer.launch({
      headless: false, // Set to false so we can see what's happening
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    
    // Set a reasonable viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Navigate to playlist
    console.log(`Navigating to: ${playlistUrl}`);
    await page.goto(playlistUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    console.log('Page loaded, waiting for content...');
    
    // Wait a bit for dynamic content to load
    await wait(2000);
    
    // Try to find playlist items with multiple selectors
    console.log('Looking for playlist items...');
    
    // Check what's actually on the page
    const pageContent = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        bodyText: document.body.innerText.substring(0, 500),
      };
    });
    console.log('Page info:', pageContent);
    
    // Try to find any video links
    const allLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/watch"]'));
      return links.map(link => ({
        href: link.getAttribute('href'),
        text: link.innerText.substring(0, 50),
      })).slice(0, 10);
    });
    console.log('Found links:', allLinks);
    
    // Wait for playlist content to load with multiple selector attempts
    let playlistFound = false;
    const selectors = [
      'ytd-playlist-panel-video-renderer', // For Mix/Radio playlists in sidebar
      'ytd-playlist-video-renderer',
      'ytd-playlist-video-list-renderer',
      'ytd-playlist-video',
      'a[href*="/watch?v="]',
    ];
    
    for (const selector of selectors) {
      try {
        await page.waitForSelector(selector, { timeout: 5000 });
        console.log(`Found selector: ${selector}`);
        playlistFound = true;
        break;
      } catch (e) {
        console.log(`Selector ${selector} not found, trying next...`);
      }
    }
    
    if (!playlistFound) {
      console.log('No playlist selectors found, trying to scroll and wait...');
    }
    
    // Scroll to load more videos (if needed)
    console.log('Scrolling to load content...');
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
    
    // Wait a bit after scrolling
    await wait(2000);
    
    // Extract video IDs and playlist title
    console.log('Extracting playlist data...');
    const playlistData = await page.evaluate(() => {
      const videoIds = [];
      
      // First, let's see what's actually in the DOM
      const allVideoLinks = Array.from(document.querySelectorAll('a')).filter(a => 
        a.href && a.href.includes('/watch?v=')
      );
      console.log(`Found ${allVideoLinks.length} total video links in page`);
      
      // Try multiple selectors for playlist items
      const selectors = [
        'ytd-playlist-video-renderer a[href*="/watch?v="]',
        'ytd-playlist-video-list-renderer a[href*="/watch?v="]',
        'ytd-playlist-video a[href*="/watch?v="]',
        'ytd-playlist-video-renderer #video-title-link',
        'ytd-playlist-video-list-renderer #video-title-link',
        'a[href*="/watch?v="]',
      ];
      
      console.log('Trying selectors in page context...');
      for (const selector of selectors) {
        try {
          const links = document.querySelectorAll(selector);
          console.log(`Selector ${selector} found ${links.length} links`);
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
            if (videoIds.length > 0) {
              console.log(`Found ${videoIds.length} videos with selector ${selector}`);
              break;
            }
          }
        } catch (e) {
          console.log(`Error with selector ${selector}:`, e.message);
        }
      }
      
      // If still no videos, try getting from all links
      if (videoIds.length === 0 && allVideoLinks.length > 0) {
        console.log('Trying to extract from all video links...');
        allVideoLinks.forEach((link) => {
          const href = link.getAttribute('href') || link.href;
          if (href) {
            const match = href.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
            if (match && !videoIds.includes(match[1])) {
              videoIds.push(match[1]);
            }
          }
        });
      }
      
      // Get playlist title
      const titleSelectors = [
        'h1.ytd-playlist-header-renderer',
        'ytd-playlist-header-renderer h1',
        '#title',
        'ytd-playlist-header-renderer #title',
        'ytd-playlist-header-renderer yt-formatted-string',
      ];
      
      let title = null;
      for (const selector of titleSelectors) {
        const titleElement = document.querySelector(selector);
        if (titleElement) {
          title = titleElement.textContent.trim();
          console.log(`Found title with selector ${selector}: ${title}`);
          break;
        }
      }
      
      // Also try to get all text content to see what's there
      const bodyText = document.body.innerText;
      const hasPlaylistText = bodyText.includes('playlist') || bodyText.includes('video');
      
      // Check for common YouTube error messages
      const errorMessages = [
        'This playlist type is unviewable',
        'This playlist is private',
        'This playlist does not exist',
        'Sign in to confirm your age',
        'unviewable',
        'private',
      ];
      const hasError = errorMessages.some(msg => bodyText.toLowerCase().includes(msg.toLowerCase()));
      
      // Check if this is a Mix/Radio playlist (they usually have "Mix" or "Radio" in the title or URL)
      const isMixPlaylist = window.location.href.includes('RD') || 
                           bodyText.toLowerCase().includes('mix') ||
                           bodyText.toLowerCase().includes('radio');
      
      // Get the structure of the page
      const pageStructure = {
        hasPlaylistRenderer: !!document.querySelector('ytd-playlist-renderer'),
        hasPlaylistVideoRenderer: !!document.querySelector('ytd-playlist-video-renderer'),
        hasPlaylistVideoListRenderer: !!document.querySelector('ytd-playlist-video-list-renderer'),
        hasTwoColumnBrowseResults: !!document.querySelector('ytd-two-column-browse-results-renderer'),
      };
      
      return { 
        videoIds, 
        title, 
        hasPlaylistText, 
        bodyTextLength: bodyText.length,
        hasError,
        errorMessage: hasError ? errorMessages.find(msg => bodyText.toLowerCase().includes(msg.toLowerCase())) : null,
        pageStructure,
        allVideoLinksCount: allVideoLinks.length,
        isMixPlaylist,
        url: window.location.href,
      };
    });
    
    console.log('Extracted data:', playlistData);
    
    await browser.close();
    
    // If we found videos, return them even if it's a Mix playlist
    if (playlistData.videoIds.length > 0) {
      console.log(`\n✅ Successfully extracted ${playlistData.videoIds.length} video IDs`);
      if (playlistData.isMixPlaylist) {
        console.log('⚠️  This is a Mix/Radio playlist, but we were able to extract videos from the sidebar');
      }
      return {
        videoIds: playlistData.videoIds,
        title: playlistData.title,
        isMixPlaylist: playlistData.isMixPlaylist,
      };
    }
    
    // If it's a Mix playlist or has an error and we found no videos, return empty but with metadata
    if (playlistData.isMixPlaylist || playlistData.hasError) {
      console.log('\n⚠️  This appears to be a YouTube-generated Mix/Radio playlist or has an error');
      console.log('These playlists cannot be scraped directly.');
      return {
        videoIds: [],
        title: playlistData.title,
        isMixPlaylist: true,
        hasError: playlistData.hasError,
        errorMessage: playlistData.errorMessage,
      };
    }
    
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

// Test with the URL from the error
const testUrl = process.argv[2] || 'https://www.youtube.com/playlist?list=RDNUsoVlDFqZg';

console.log('Testing playlist scraper with URL:', testUrl);
scrapePlaylistWithPuppeteer(testUrl)
  .then((result) => {
    console.log('\n=== RESULT ===');
    console.log('Title:', result.title);
    console.log('Video IDs found:', result.videoIds.length);
    if (result.videoIds.length > 0) {
      console.log('First 10 Video IDs:', result.videoIds.slice(0, 10));
    } else {
      console.log('\n=== DEBUGGING INFO ===');
      if (result.isMixPlaylist) {
        console.log('⚠️  This is a YouTube-generated Mix/Radio playlist');
        console.log('These playlists are dynamically generated and cannot be scraped.');
        console.log('Solution: Extract the video ID from the original URL and create a playlist with just that video.');
      }
      if (result.hasError) {
        console.log('Has error:', result.hasError);
        console.log('Error message:', result.errorMessage);
      }
      console.log('Page structure:', result.pageStructure);
      console.log('All video links count:', result.allVideoLinksCount);
      console.log('\n💡 Try using a regular user-created playlist URL instead.');
    }
  })
  .catch((error) => {
    console.error('\n=== ERROR ===');
    console.error(error);
    process.exit(1);
  });
