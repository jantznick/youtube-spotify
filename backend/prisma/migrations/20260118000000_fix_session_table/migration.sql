-- Fix session table to match schema
-- Convert sess column from TEXT to JSONB if needed
DO $$
BEGIN
    -- Check if sess column is TEXT and needs conversion
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
END $$;

-- Fix index name if it's wrong
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
