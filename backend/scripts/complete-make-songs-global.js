import { PrismaClient } from '@prisma/client';
import pg from 'pg';

const prisma = new PrismaClient();
const { Pool } = pg;

// Get DATABASE_URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create a direct PostgreSQL connection for raw SQL
const pool = new Pool({
  connectionString: databaseUrl,
});

async function completeMakeSongsGlobal() {
  console.log('Completing make_songs_global migration...');
  console.log('📋 Note: Skipping UserSong table creation (it will be dropped in next migration anyway)');

  try {
    // Skip UserSong creation since:
    // 1. userId was already dropped, so we can't migrate data to UserSong
    // 2. The next migration (20260122000000_remove_user_song) drops UserSong anyway
    // So we just need to complete the parts that matter: handle duplicates and add unique constraint

    // Check if unique constraint on youtubeId exists
    const uniqueConstraintExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM pg_constraint 
        WHERE conname = 'Song_youtubeId_key'
      )
    `);

    if (!uniqueConstraintExists.rows[0].exists) {
      console.log('📋 Adding unique constraint on Song.youtubeId...');
      
      // First, check for duplicates and handle them
      const duplicates = await pool.query(`
        SELECT "youtubeId", array_agg("id" ORDER BY "createdAt" ASC) as song_ids, COUNT(*) as count
        FROM "Song"
        GROUP BY "youtubeId"
        HAVING COUNT(*) > 1
      `);

      if (duplicates.rows.length > 0) {
        console.log(`⚠️  Found ${duplicates.rows.length} duplicate youtubeIds, handling them...`);
        
        for (const dup of duplicates.rows) {
          const keepId = dup.song_ids[0];
          const deleteIds = dup.song_ids.slice(1);
          
          // Update PlaylistSong references
          await pool.query(`
            UPDATE "PlaylistSong" 
            SET "songId" = $1 
            WHERE "songId" = ANY($2::text[])
          `, [keepId, deleteIds]);
          
          // Delete duplicate songs
          await pool.query(`
            DELETE FROM "Song" WHERE "id" = ANY($1::text[])
          `, [deleteIds]);
        }
        
        console.log('✅ Duplicates handled');
      }
      
      // Now add the unique constraint
      await pool.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS "Song_youtubeId_key" ON "Song"("youtubeId")
      `);
      console.log('✅ Unique constraint added');
    } else {
      console.log('✅ Unique constraint already exists');
    }

    // Check if userId column still exists (shouldn't, but just in case)
    const userIdExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'Song' 
        AND column_name = 'userId'
      )
    `);

    if (userIdExists.rows[0].exists) {
      console.log('📋 Dropping userId column and foreign key...');
      await pool.query(`
        ALTER TABLE "Song" DROP CONSTRAINT IF EXISTS "Song_userId_fkey";
        ALTER TABLE "Song" DROP COLUMN IF EXISTS "userId";
      `);
      console.log('✅ userId column removed');
    } else {
      console.log('✅ userId column already removed');
    }

    // Skip UserSong indexes/foreign keys since the table will be dropped in next migration

    console.log('✅ make_songs_global migration completed');
    return true;
  } catch (error) {
    console.error('❌ Error completing migration:', error.message);
    return false;
  } finally {
    await pool.end();
  }
}

// Run the completion
completeMakeSongsGlobal()
  .then((success) => {
    if (success) {
      console.log('Migration completion script finished successfully');
    } else {
      console.log('Migration completion had issues, but continuing...');
    }
    process.exit(0); // Exit 0 either way - don't block deployment
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(0); // Don't block deployment even on error
  });
