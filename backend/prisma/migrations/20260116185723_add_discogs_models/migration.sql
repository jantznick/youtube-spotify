/*
  Warnings:

  - The primary key for the `session` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "discogsArtistIds" JSONB,
ADD COLUMN     "discogsCountry" TEXT,
ADD COLUMN     "discogsExtraArtists" JSONB,
ADD COLUMN     "discogsFormat" TEXT,
ADD COLUMN     "discogsGenres" JSONB,
ADD COLUMN     "discogsLabel" TEXT,
ADD COLUMN     "discogsLastUpdated" TIMESTAMP(3),
ADD COLUMN     "discogsMasterId" TEXT,
ADD COLUMN     "discogsReleaseId" TEXT,
ADD COLUMN     "discogsReleased" TEXT,
ADD COLUMN     "discogsStyles" JSONB,
ADD COLUMN     "discogsTrackPosition" TEXT,
ALTER COLUMN "youtubeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "session" DROP CONSTRAINT "session_pkey",
ALTER COLUMN "sid" SET DATA TYPE TEXT,
ADD CONSTRAINT "session_pkey" PRIMARY KEY ("sid");

-- CreateTable
CREATE TABLE "DiscogsArtist" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameVariations" JSONB,
    "aliases" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscogsArtist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscogsRelease" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "genres" JSONB,
    "styles" JSONB,
    "released" TEXT,
    "dataQuality" TEXT,
    "youtubeVideos" JSONB,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiscogsRelease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscogsReleaseArtist" (
    "releaseId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,

    CONSTRAINT "DiscogsReleaseArtist_pkey" PRIMARY KEY ("releaseId","artistId")
);

-- CreateTable
CREATE TABLE "DiscogsDataSync" (
    "id" TEXT NOT NULL,
    "dumpDate" TEXT NOT NULL,
    "artistsFile" TEXT,
    "releasesFile" TEXT,
    "artistsProcessed" INTEGER NOT NULL DEFAULT 0,
    "releasesProcessed" INTEGER NOT NULL DEFAULT 0,
    "tracksProcessed" INTEGER NOT NULL DEFAULT 0,
    "songsUpserted" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "DiscogsDataSync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiscogsArtist_name_idx" ON "DiscogsArtist"("name");

-- CreateIndex
CREATE INDEX "DiscogsRelease_title_idx" ON "DiscogsRelease"("title");

-- CreateIndex
CREATE INDEX "DiscogsDataSync_status_idx" ON "DiscogsDataSync"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DiscogsDataSync_dumpDate_key" ON "DiscogsDataSync"("dumpDate");

-- CreateIndex
CREATE INDEX "Song_title_idx" ON "Song"("title");

-- CreateIndex
CREATE INDEX "Song_artist_idx" ON "Song"("artist");

-- CreateIndex
CREATE INDEX "Song_youtubeId_idx" ON "Song"("youtubeId");

-- CreateIndex
CREATE INDEX "Song_discogsReleaseId_idx" ON "Song"("discogsReleaseId");

-- AddForeignKey
ALTER TABLE "DiscogsReleaseArtist" ADD CONSTRAINT "DiscogsReleaseArtist_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "DiscogsRelease"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscogsReleaseArtist" ADD CONSTRAINT "DiscogsReleaseArtist_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "DiscogsArtist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "IDX_session_expire" RENAME TO "session_expire_idx";
