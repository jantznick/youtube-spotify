-- Drop foreign key constraint from DiscogsReleaseArtist
ALTER TABLE "DiscogsReleaseArtist" DROP CONSTRAINT IF EXISTS "DiscogsReleaseArtist_artistId_fkey";

-- Drop the DiscogsArtist table (will lose all data)
DROP TABLE IF EXISTS "DiscogsArtist";

-- Recreate DiscogsArtist with new schema (UUID primary key, name as unique)
CREATE TABLE "DiscogsArtist" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "discogsId" TEXT,
    "name" TEXT NOT NULL,
    "realname" TEXT,
    "profile" TEXT,
    "dataQuality" TEXT,
    "urls" JSONB,
    "nameVariations" JSONB,
    "aliases" JSONB,
    "members" JSONB,
    "groups" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscogsArtist_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint on name
CREATE UNIQUE INDEX "DiscogsArtist_name_key" ON "DiscogsArtist"("name");

-- Create indexes
CREATE INDEX "DiscogsArtist_name_idx" ON "DiscogsArtist"("name");
CREATE INDEX "DiscogsArtist_discogsId_idx" ON "DiscogsArtist"("discogsId");

-- Recreate foreign key constraint
ALTER TABLE "DiscogsReleaseArtist" ADD CONSTRAINT "DiscogsReleaseArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "DiscogsArtist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
