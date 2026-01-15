-- Fix migration drift - add missing Playlist columns if they don't exist
DO $$
BEGIN
    -- Add sourceUrl if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'Playlist' 
        AND column_name = 'sourceUrl'
    ) THEN
        ALTER TABLE "Playlist" ADD COLUMN "sourceUrl" TEXT;
    END IF;

    -- Add sourceType if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'Playlist' 
        AND column_name = 'sourceType'
    ) THEN
        ALTER TABLE "Playlist" ADD COLUMN "sourceType" TEXT;
    END IF;

    -- Add autoUpdate if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'Playlist' 
        AND column_name = 'autoUpdate'
    ) THEN
        ALTER TABLE "Playlist" ADD COLUMN "autoUpdate" BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- Add lastSyncedAt if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'Playlist' 
        AND column_name = 'lastSyncedAt'
    ) THEN
        ALTER TABLE "Playlist" ADD COLUMN "lastSyncedAt" TIMESTAMP(3);
    END IF;
END $$;

-- Fix session table structure to match schema
DO $$
BEGIN
    -- Check if sess column is TEXT and needs conversion to JSONB
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'session' 
        AND column_name = 'sess' 
        AND data_type = 'text'
    ) THEN
        -- Convert TEXT to JSONB
        ALTER TABLE "session" ALTER COLUMN "sess" TYPE JSONB USING sess::jsonb;
    END IF;

    -- Check if sid column type needs to be fixed
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'session' 
        AND column_name = 'sid' 
        AND data_type != 'character varying'
    ) THEN
        -- Ensure sid is VARCHAR
        ALTER TABLE "session" ALTER COLUMN "sid" TYPE VARCHAR;
    END IF;

    -- Ensure primary key exists
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

-- Fix index name if needed
DO $$
BEGIN
    -- Drop old index name if it exists
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'session_expire_idx' AND tablename = 'session') THEN
        DROP INDEX "session_expire_idx";
    END IF;
    
    -- Create correct index if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'IDX_session_expire' AND tablename = 'session') THEN
        CREATE INDEX "IDX_session_expire" ON "session"("expire");
    END IF;
END $$;
