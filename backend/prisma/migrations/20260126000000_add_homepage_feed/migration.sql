-- CreateTable
CREATE TABLE IF NOT EXISTS "HomePageFeed" (
    "id" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "songs" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomePageFeed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "HomePageFeed_genre_key" ON "HomePageFeed"("genre");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "HomePageFeed_genre_idx" ON "HomePageFeed"("genre");
