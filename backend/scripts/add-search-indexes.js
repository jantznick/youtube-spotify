import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSearchIndexes() {
  console.log('🔍 Adding search optimization indexes...\n');

  try {
    // Enable pg_trgm extension (required for trigram indexes)
    console.log('1. Enabling pg_trgm extension...');
    await prisma.$executeRawUnsafe(`
      CREATE EXTENSION IF NOT EXISTS pg_trgm;
    `);
    console.log('   ✅ Extension enabled\n');

    // Add GIN trigram index for DiscogsArtist.name (case-insensitive search)
    console.log('2. Creating GIN index on DiscogsArtist.name...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS "DiscogsArtist_name_gin_idx" 
      ON "DiscogsArtist" USING gin (LOWER(name) gin_trgm_ops);
    `);
    console.log('   ✅ Index created\n');

    // Add GIN trigram index for Song.title (case-insensitive search)
    console.log('3. Creating GIN index on Song.title...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS "Song_title_gin_idx" 
      ON "Song" USING gin (LOWER(title) gin_trgm_ops);
    `);
    console.log('   ✅ Index created\n');

    // Add GIN trigram index for Song.artist (case-insensitive search)
    console.log('4. Creating GIN index on Song.artist...');
    await prisma.$executeRawUnsafe(`
      CREATE INDEX CONCURRENTLY IF NOT EXISTS "Song_artist_gin_idx" 
      ON "Song" USING gin (LOWER(artist) gin_trgm_ops) 
      WHERE artist IS NOT NULL;
    `);
    console.log('   ✅ Index created\n');

    console.log('✅ All search indexes created successfully!\n');
    console.log('📊 Index Summary:');
    console.log('   - DiscogsArtist.name: GIN trigram (case-insensitive)');
    console.log('   - Song.title: GIN trigram (case-insensitive)');
    console.log('   - Song.artist: GIN trigram (case-insensitive, partial)');
    console.log('\n💡 These indexes will significantly speed up LIKE queries with contains patterns.\n');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (process.argv[1]?.includes('add-search-indexes.js')) {
  addSearchIndexes()
    .then(() => {
      console.log('✅ Done!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

export default addSearchIndexes;
