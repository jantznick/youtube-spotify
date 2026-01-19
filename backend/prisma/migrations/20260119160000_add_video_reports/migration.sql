-- CreateTable
CREATE TABLE "VideoReport" (
    "id" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "youtubeId" TEXT,
    "newYoutubeId" TEXT,
    "reportedBy" TEXT,
    "reporterEmail" TEXT,
    "reporterName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "resolutionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VideoReport_songId_idx" ON "VideoReport"("songId");

-- CreateIndex
CREATE INDEX "VideoReport_status_idx" ON "VideoReport"("status");

-- CreateIndex
CREATE INDEX "VideoReport_createdAt_idx" ON "VideoReport"("createdAt");

-- AddForeignKey
ALTER TABLE "VideoReport" ADD CONSTRAINT "VideoReport_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "VideoReport_songId_idx" ON "VideoReport"("songId");

-- CreateIndex
CREATE INDEX "VideoReport_status_idx" ON "VideoReport"("status");

-- CreateIndex
CREATE INDEX "VideoReport_createdAt_idx" ON "VideoReport"("createdAt");

-- AddForeignKey
ALTER TABLE "VideoReport" ADD CONSTRAINT "VideoReport_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE CASCADE ON UPDATE CASCADE;
