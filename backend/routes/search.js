import express from 'express';
import { prisma } from '../server.js';

const router = express.Router();

// GET /api/search?q=query
router.get('/', async (req, res) => {
  try {
    const query = req.query.q || '';
    
    if (!query || query.length < 3) {
      return res.json({
        query: query || '', // Include query even for empty responses
        artists: [],
        songs: [],
      });
    }

    // Search artists by name (case-insensitive, limit 15)
    const artists = await prisma.discogsArtist.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      take: 25, // Fetch more to sort by popularity, then limit to 15
      select: {
        id: true,
        name: true,
        profile: true,
      },
    });

    // Sort by profile length (popularity indicator) and take top 15
    const sortedArtists = artists
      .sort((a, b) => {
        const aLength = a.profile ? a.profile.length : 0;
        const bLength = b.profile ? b.profile.length : 0;
        return bLength - aLength; // Descending order (longer = more popular)
      })
      .slice(0, 15)
      .map(({ profile, ...rest }) => rest); // Remove profile from response

    // Search songs by title or artist (case-insensitive, limit 15)
    const songs = await prisma.song.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: 'insensitive',
            },
          },
          {
            artist: {
              contains: query,
              mode: 'insensitive',
            },
          },
        ],
      },
      take: 15,
      orderBy: [
        {
          title: 'asc',
        },
      ],
      select: {
        id: true,
        title: true,
        artist: true,
        youtubeId: true,
        thumbnailUrl: true,
        artistIds: true,
      },
    });

    // Format results (already sorted and limited above)
    const formattedArtists = sortedArtists.map((artist) => ({
      id: artist.id,
      name: artist.name,
    }));

    // Format songs - artistIds is already stored as UUIDs
    const formattedSongs = songs.map((song) => ({
      id: song.id,
      title: song.title,
      artist: song.artist || 'Unknown Artist',
      youtubeId: song.youtubeId,
      thumbnailUrl: song.thumbnailUrl || (song.youtubeId ? `https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg` : null),
      artistIds: song.artistIds || null,
    }));

    res.json({
      query: query, // Include query in response to prevent race conditions
      artists: formattedArtists,
      songs: formattedSongs,
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

// GET /api/search/song/:id
router.get('/song/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const song = await prisma.song.findUnique({
      where: { id },
    });

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Format response
    // Prisma returns JSON fields as objects/arrays, not strings
    const formattedSong = {
      id: song.id,
      title: song.title,
      artist: song.artist || 'Unknown Artist',
      youtubeId: song.youtubeId,
      thumbnailUrl: song.thumbnailUrl || (song.youtubeId ? `https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg` : null),
      duration: song.duration,
      releaseId: song.releaseId,
      discogsGenres: song.discogsGenres || null,
      discogsStyles: song.discogsStyles || null,
      discogsCountry: song.discogsCountry,
      discogsReleased: song.discogsReleased,
      discogsTrackPosition: song.discogsTrackPosition,
      artistIds: song.artistIds || null,
    };
    
    res.json(formattedSong);
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({ error: 'Failed to fetch song' });
  }
});

// GET /api/search/artist/:id
router.get('/artist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get artist
    const artist = await prisma.discogsArtist.findUnique({
      where: { id },
    });

    if (!artist) {
      return res.status(404).json({ error: 'Artist not found' });
    }

    // Get all releases for this artist
    const releaseArtists = await prisma.discogsReleaseArtist.findMany({
      where: { artistId: id },
      include: {
        DiscogsRelease: {
          include: {
            DiscogsReleaseArtist: {
              include: {
                DiscogsArtist: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        DiscogsRelease: {
          createdAt: 'desc',
        },
      },
    });

    // Get songs for each release
    const releasesWithSongs = await Promise.all(
      releaseArtists.map(async (releaseArtist) => {
        const release = releaseArtist.DiscogsRelease;
        
        // Get all songs for this release
        const songs = await prisma.song.findMany({
          where: {
            releaseId: release.id,
          },
          orderBy: {
            discogsTrackPosition: 'asc',
          },
          select: {
            id: true,
            title: true,
            youtubeId: true,
            discogsTrackPosition: true,
            duration: true,
            thumbnailUrl: true,
          },
        });

        // Format release data
        // Prisma returns JSON fields as objects/arrays, not strings
        const formattedRelease = {
          id: release.id,
          title: release.title,
          released: release.released,
          genres: release.genres || null,
          styles: release.styles || null,
          songs: songs.map((song) => ({
            id: song.id,
            title: song.title,
            youtubeId: song.youtubeId,
            discogsTrackPosition: song.discogsTrackPosition,
            duration: song.duration,
            thumbnailUrl: song.thumbnailUrl || (song.youtubeId ? `https://i.ytimg.com/vi/${song.youtubeId}/hqdefault.jpg` : null),
          })),
        };

        return formattedRelease;
      })
    );

    // Remove duplicates (same release might appear multiple times if artist has multiple roles)
    const uniqueReleases = releasesWithSongs.filter((release, index, self) =>
      index === self.findIndex((r) => r.id === release.id)
    );

    // Format artist response
    const formattedArtist = {
      id: artist.id,
      name: artist.name,
      profile: artist.profile,
      releases: uniqueReleases,
    };
    
    res.json(formattedArtist);
  } catch (error) {
    console.error('Error fetching artist:', error);
    res.status(500).json({ error: 'Failed to fetch artist' });
  }
});

export default router;
