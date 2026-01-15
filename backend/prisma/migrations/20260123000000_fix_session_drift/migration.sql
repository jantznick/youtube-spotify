-- Fix session table structure to match schema
-- This migration fixes drift without dropping the database
-- Converts existing session table from TEXT to JSONB for sess column

-- Step 1: Ensure sid is VARCHAR (if it's not already)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'session' 
        AND column_name = 'sid'
    ) THEN
        -- Check current type and convert if needed
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'session' 
            AND column_name = 'sid'
            AND data_type != 'character varying'
        ) THEN
            ALTER TABLE "session" ALTER COLUMN "sid" TYPE VARCHAR;
        END IF;
    END IF;
END $$;

-- Step 2: Convert sess from TEXT to JSONB if needed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'session' 
        AND column_name = 'sess' 
        AND data_type = 'text'
    ) THEN
        -- Convert TEXT to JSONB
        -- First, try to parse existing data as JSON
        ALTER TABLE "session" ALTER COLUMN "sess" TYPE JSONB USING sess::jsonb;
    END IF;
END $$;

-- Step 3: Ensure primary key exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
        AND table_name = 'session' 
        AND constraint_type = 'PRIMARY KEY'
    ) THEN
        -- Add primary key if it doesn't exist
        ALTER TABLE "session" ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");
    END IF;
END $$;

-- Step 4: Fix index name if needed
DO $$
BEGIN
    -- Drop old index name if it exists
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'session_expire_idx' AND tablename = 'session') THEN
        DROP INDEX IF EXISTS "session_expire_idx";
    END IF;
    
    -- Create correct index if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_session_expire' AND tablename = 'session') THEN
        CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session"("expire");
    END IF;
END $$;
