-- AlterTable
ALTER TABLE "Playlist" ADD COLUMN "sourceUrl" TEXT,
ADD COLUMN "sourceType" TEXT,
ADD COLUMN "autoUpdate" BOOLEAN NOT NULL DEFAULT false;
