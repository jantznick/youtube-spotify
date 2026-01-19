-- Remove unique constraint from Song.youtubeId
-- This allows the same YouTube video to be associated with multiple songs
-- (e.g., same song appearing on different albums/releases)

-- Drop the unique constraint/index
DROP INDEX IF EXISTS "Song_youtubeId_key";

-- Note: The index "Song_youtubeId_idx" will remain for query performance
-- (it's not unique, just indexed)
