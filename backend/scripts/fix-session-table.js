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

async function fixSessionTable() {
  console.log('Checking and fixing session table structure...');

  try {
    // Step 1: Ensure sid is VARCHAR
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'session' 
          AND column_name = 'sid'
        ) THEN
          IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'session' 
            AND column_name = 'sid'
            AND data_type != 'character varying'
          ) THEN
            ALTER TABLE "session" ALTER COLUMN "sid" TYPE VARCHAR;
            RAISE NOTICE 'Converted sid to VARCHAR';
          END IF;
        END IF;
      END $$;
    `);

    // Step 2: Convert sess from TEXT to JSONB if needed
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'session' 
          AND column_name = 'sess' 
          AND data_type = 'text'
        ) THEN
          ALTER TABLE "session" ALTER COLUMN "sess" TYPE JSONB USING sess::jsonb;
          RAISE NOTICE 'Converted sess from TEXT to JSONB';
        END IF;
      END $$;
    `);

    // Step 3: Ensure primary key exists
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE table_schema = 'public' 
          AND table_name = 'session' 
          AND constraint_type = 'PRIMARY KEY'
        ) THEN
          ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");
          RAISE NOTICE 'Added primary key to session table';
        END IF;
      END $$;
    `);

    // Step 4: Fix index name
    await pool.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'session_expire_idx' AND tablename = 'session') THEN
          DROP INDEX IF EXISTS "session_expire_idx";
          RAISE NOTICE 'Dropped old session_expire_idx index';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_session_expire' AND tablename = 'session') THEN
          CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session"("expire");
          RAISE NOTICE 'Created IDX_session_expire index';
        END IF;
      END $$;
    `);

    console.log('✅ Session table structure verified/fixed');
    return true;
  } catch (error) {
    console.error('❌ Error fixing session table:', error.message);
    // Don't exit - let migrations continue
    return false;
  } finally {
    await pool.end();
  }
}

// Run the fix
fixSessionTable()
  .then((success) => {
    if (success) {
      console.log('Session table fix completed successfully');
    } else {
      console.log('Session table fix had issues, but continuing...');
    }
    process.exit(success ? 0 : 0); // Exit 0 either way - don't block deployment
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(0); // Don't block deployment even on error
  });
