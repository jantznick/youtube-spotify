import express from 'express';

const router = express.Router();

// Hardcoded search results
const hardcodedArtists = [
  {
    id: 'artist-1',
    name: 'The Persuader',
    discogsId: '12345',
  },
  {
    id: 'artist-2',
    name: 'Josh Wink',
    discogsId: '67890',
  },
  {
    id: 'artist-3',
    name: 'Mood II Swing',
    discogsId: '11111',
  },
];

const hardcodedSongs = [
  {
    id: 'song-1',
    title: 'Östermalm',
    artist: 'The Persuader',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg',
  },
  {
    id: 'song-2',
    title: 'When The Funk Hits The Fan',
    artist: 'Mood II Swing',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg',
  },
  {
    id: 'song-3',
    title: 'D2',
    artist: 'Josh Wink',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg',
  },
];

// GET /api/search?q=query
router.get('/', (req, res) => {
  const query = req.query.q || '';
  
  // For now, return hardcoded results regardless of query
  // Later we'll filter based on query
  res.json({
    artists: hardcodedArtists,
    songs: hardcodedSongs,
  });
});

// GET /api/search/song/:id
router.get('/song/:id', (req, res) => {
  const { id } = req.params;
  
  // Hardcoded song details
  const song = {
    id: id,
    title: 'Östermalm',
    artist: 'The Persuader',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg',
    duration: 285,
    discogsReleaseId: 'release-1',
    discogsGenres: ['Electronic'],
    discogsStyles: ['Techno', 'Deep House'],
    discogsCountry: 'Sweden',
    discogsReleased: '1999',
  };
  
  res.json(song);
});

// GET /api/search/artist/:id
router.get('/artist/:id', (req, res) => {
  const { id } = req.params;
  
  // Hardcoded artist details with releases
  const artist = {
    id: id,
    name: 'The Persuader',
    discogsId: '12345',
    profile: 'Swedish techno producer known for deep, atmospheric tracks.',
    releases: [
      {
        id: 'release-1',
        title: 'Stockholm',
        released: '1999',
        genres: ['Electronic'],
        styles: ['Techno', 'Deep House'],
        songs: [
          {
            id: 'song-1',
            title: 'Östermalm',
            youtubeId: 'dQw4w9WgXcQ',
            discogsTrackPosition: 'A',
            duration: 285,
          },
          {
            id: 'song-2',
            title: 'Vasastaden',
            youtubeId: 'dQw4w9WgXcQ',
            discogsTrackPosition: 'B1',
            duration: 371,
          },
          {
            id: 'song-3',
            title: 'Kungsholmen',
            youtubeId: 'dQw4w9WgXcQ',
            discogsTrackPosition: 'B2',
            duration: 169,
          },
        ],
      },
      {
        id: 'release-2',
        title: 'Another Release',
        released: '2001',
        genres: ['Electronic'],
        styles: ['Techno'],
        songs: [
          {
            id: 'song-4',
            title: 'Track One',
            youtubeId: 'dQw4w9WgXcQ',
            discogsTrackPosition: '1',
            duration: 240,
          },
        ],
      },
    ],
  };
  
  res.json(artist);
});

export default router;
