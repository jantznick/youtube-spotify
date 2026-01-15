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

async function safeDropUserId() {
  console.log('Checking if userId column exists on Song table...');

  try {
    // Check if userId column exists
    const columnCheck = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'Song' 
      AND column_name = 'userId'
    `);

    if (columnCheck.rows.length === 0) {
      console.log('✅ userId column does not exist on Song table (already removed)');
      return true;
    }

    console.log('⚠️  userId column exists on Song table');
    console.log('📋 Dropping userId column from Song table (songs are now global)...');
    
    // Drop the column (this is safe - we intentionally removed userId from songs)
    await pool.query(`
      ALTER TABLE "Song" DROP COLUMN IF EXISTS "userId";
    `);

    console.log('✅ Successfully dropped userId column from Song table');
    return true;
  } catch (error) {
    console.error('❌ Error dropping userId column:', error.message);
    // Don't exit - let migrations continue
    return false;
  } finally {
    await pool.end();
  }
}

// Run the fix
safeDropUserId()
  .then((success) => {
    if (success) {
      console.log('userId column removal completed successfully');
    } else {
      console.log('userId column removal had issues, but continuing...');
    }
    process.exit(0); // Exit 0 either way - don't block deployment
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(0); // Don't block deployment even on error
  });
