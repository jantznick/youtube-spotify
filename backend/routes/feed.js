import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

// Get homepage feed (public endpoint)
router.get('/homepage', async (req, res) => {
  try {
    // Get all feed entries
    const allFeedEntries = await prisma.homePageFeed.findMany();

    // If no feed entries, return empty array
    if (allFeedEntries.length === 0) {
      return res.json({ homePageFeed: [] });
    }

    // Randomly select 3 entries (or all if less than 3)
    const selectedEntries = allFeedEntries
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(4, allFeedEntries.length));

    // Fetch songs for each selected genre
    const homePageFeed = await Promise.all(
      selectedEntries.map(async (entry) => {
        // songs is stored as JSONB, Prisma returns it as an array
        const songIds = Array.isArray(entry.songs) ? entry.songs : [];
        
        // Fetch all songs by IDs
        const songs = songIds.length > 0 ? await prisma.song.findMany({
          where: {
            id: {
              in: songIds,
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }) : [];

        // Debug logging
        if (songIds.length > 0 && songs.length !== songIds.length) {
          console.warn(`[FEED] Genre "${entry.genre}": Expected ${songIds.length} songs, found ${songs.length}`);
        }
        const songsWithoutYoutubeId = songs.filter(s => !s.youtubeId);
        if (songsWithoutYoutubeId.length > 0) {
          console.warn(`[FEED] Genre "${entry.genre}": ${songsWithoutYoutubeId.length} songs missing youtubeId`);
        }

        // Map to the expected format
        return {
          genre: entry.genre,
          tagline: entry.tagline || null,
          sourceType: entry.sourceType || null,
          songs: songs
            .filter(song => song.youtubeId) // Filter out songs without youtubeId
            .map((song) => ({
              id: song.id,
              title: song.title,
              artist: song.artist,
              thumbnailUrl: song.thumbnailUrl,
              duration: song.duration,
              youtubeId: song.youtubeId, // Include youtubeId for Player component
              url: `https://www.youtube.com/watch?v=${song.youtubeId}`,
            })),
        };
      })
    );

    res.json({
      homePageFeed,
    });
  } catch (error) {
    console.error('Get homepage feed error:', error);
    res.status(500).json({ error: 'Failed to get homepage feed' });
  }
});

export default router;
