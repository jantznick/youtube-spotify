-- AlterTable
ALTER TABLE "MagicToken" ADD COLUMN     "username" TEXT,
ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "MagicToken_username_idx" ON "MagicToken"("username");
