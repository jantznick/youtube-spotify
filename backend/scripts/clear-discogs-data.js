import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearDiscogsData() {
  try {
    console.log('🗑️  Clearing Discogs data...\n');

    // Delete songs with discogs data
    console.log('Deleting songs with Discogs data...');
    const songsDeleted = await prisma.song.deleteMany({
      where: {
        OR: [
          { releaseId: { not: null } },
          { discogsTrackPosition: { not: null } },
          { discogsGenres: { not: null } },
          { discogsStyles: { not: null } },
        ],
      },
    });
    console.log(`   ✓ Deleted ${songsDeleted.count.toLocaleString()} songs\n`);

    // Delete DiscogsReleaseArtist relationships
    console.log('Deleting DiscogsReleaseArtist relationships...');
    const releaseArtistsDeleted = await prisma.discogsReleaseArtist.deleteMany({});
    console.log(`   ✓ Deleted ${releaseArtistsDeleted.count.toLocaleString()} release-artist relationships\n`);

    // Delete DiscogsRelease records
    console.log('Deleting DiscogsRelease records...');
    const releasesDeleted = await prisma.discogsRelease.deleteMany({});
    console.log(`   ✓ Deleted ${releasesDeleted.count.toLocaleString()} releases\n`);

    // Delete DiscogsArtist records
    console.log('Deleting DiscogsArtist records...');
    const artistsDeleted = await prisma.discogsArtist.deleteMany({});
    console.log(`   ✓ Deleted ${artistsDeleted.count.toLocaleString()} artists\n`);

    // Reset sync records
    console.log('Resetting DiscogsDataSync records...');
    const syncDeleted = await prisma.discogsDataSync.deleteMany({});
    console.log(`   ✓ Deleted ${syncDeleted.count.toLocaleString()} sync records\n`);

    console.log('✅ All Discogs data cleared!\n');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (process.argv[1]?.includes('clear-discogs-data.js')) {
  clearDiscogsData()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export default clearDiscogsData;
