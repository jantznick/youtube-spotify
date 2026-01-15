-- Step 1: Create UserSong table for user libraries
CREATE TABLE IF NOT EXISTS "UserSong" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,

    CONSTRAINT "UserSong_pkey" PRIMARY KEY ("id")
);

-- Step 2: Migrate existing user-song relationships to UserSong table
-- Use a subquery to generate unique IDs and avoid duplicates
INSERT INTO "UserSong" ("id", "createdAt", "userId", "songId")
SELECT 
    gen_random_uuid()::text,
    "createdAt",
    "userId",
    "id"
FROM "Song"
WHERE NOT EXISTS (
    SELECT 1 FROM "UserSong" 
    WHERE "UserSong"."userId" = "Song"."userId" 
    AND "UserSong"."songId" = "Song"."id"
);

-- Step 3: Remove userId from Song and add unique constraint on youtubeId
-- First, ensure no duplicate youtubeIds exist (keep the oldest one)
DO $$
DECLARE
    dup_record RECORD;
BEGIN
    FOR dup_record IN 
        SELECT "youtubeId", array_agg("id" ORDER BY "createdAt" ASC) as song_ids
        FROM "Song"
        GROUP BY "youtubeId"
        HAVING COUNT(*) > 1
    LOOP
        -- Keep the first song, delete others and update references
        DECLARE
            keep_id TEXT := dup_record.song_ids[1];
            delete_ids TEXT[] := dup_record.song_ids[2:array_length(dup_record.song_ids, 1)];
            delete_id TEXT;
        BEGIN
            -- Update PlaylistSong references to point to the kept song
            UPDATE "PlaylistSong" 
            SET "songId" = keep_id 
            WHERE "songId" = ANY(delete_ids);
            
            -- Update UserSong references to point to the kept song
            -- First, remove UserSong entries that would create duplicates
            DELETE FROM "UserSong" us1
            WHERE us1."songId" = ANY(delete_ids)
            AND EXISTS (
                SELECT 1 FROM "UserSong" us2
                WHERE us2."userId" = us1."userId"
                AND us2."songId" = keep_id
            );
            
            -- Now update remaining UserSong references
            UPDATE "UserSong" 
            SET "songId" = keep_id 
            WHERE "songId" = ANY(delete_ids);
            
            -- Delete duplicate songs
            DELETE FROM "Song" WHERE "id" = ANY(delete_ids);
        END;
    END LOOP;
END $$;

-- Step 4: Remove userId column and add unique constraint
ALTER TABLE "Song" DROP CONSTRAINT IF EXISTS "Song_userId_fkey";
ALTER TABLE "Song" DROP COLUMN IF EXISTS "userId";
CREATE UNIQUE INDEX IF NOT EXISTS "Song_youtubeId_key" ON "Song"("youtubeId");

-- Step 5: Add foreign keys and indexes for UserSong
CREATE INDEX IF NOT EXISTS "UserSong_userId_idx" ON "UserSong"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "UserSong_userId_songId_key" ON "UserSong"("userId", "songId");
ALTER TABLE "UserSong" ADD CONSTRAINT "UserSong_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserSong" ADD CONSTRAINT "UserSong_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
