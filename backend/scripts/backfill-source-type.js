import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillSourceType() {
  console.log('Starting sourceType backfill...');

  // Update playlists with names ending in "- YouTube" or "- Spotify"
  const youtubeByName = await prisma.playlist.updateMany({
    where: {
      sourceType: null,
      name: {
        contains: '- YouTube',
        mode: 'insensitive',
      },
    },
    data: {
      sourceType: 'youtube',
    },
  });
  console.log(`Updated ${youtubeByName.count} playlists to youtube (by name)`);

  const spotifyByName = await prisma.playlist.updateMany({
    where: {
      sourceType: null,
      name: {
        contains: '- Spotify',
        mode: 'insensitive',
      },
    },
    data: {
      sourceType: 'spotify',
    },
  });
  console.log(`Updated ${spotifyByName.count} playlists to spotify (by name)`);

  // Update playlists with sourceUrl but no sourceType
  const youtubeByUrl = await prisma.playlist.updateMany({
    where: {
      sourceType: null,
      sourceUrl: {
        contains: 'youtube.com',
      },
    },
    data: {
      sourceType: 'youtube',
    },
  });
  console.log(`Updated ${youtubeByUrl.count} playlists to youtube (by URL)`);

  const youtubeByShortUrl = await prisma.playlist.updateMany({
    where: {
      sourceType: null,
      sourceUrl: {
        contains: 'youtu.be',
      },
    },
    data: {
      sourceType: 'youtube',
    },
  });
  console.log(`Updated ${youtubeByShortUrl.count} playlists to youtube (by short URL)`);

  const spotifyByUrl = await prisma.playlist.updateMany({
    where: {
      sourceType: null,
      sourceUrl: {
        contains: 'spotify.com',
      },
    },
    data: {
      sourceType: 'spotify',
    },
  });
  console.log(`Updated ${spotifyByUrl.count} playlists to spotify (by URL)`);

  console.log('Backfill complete!');
}

backfillSourceType()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
