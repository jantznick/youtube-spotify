-- AlterTable
ALTER TABLE "VideoReport" ADD CONSTRAINT "VideoReport_reportedBy_fkey" FOREIGN KEY ("reportedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "VideoReport" ADD CONSTRAINT "VideoReport_resolvedBy_fkey" FOREIGN KEY ("resolvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
