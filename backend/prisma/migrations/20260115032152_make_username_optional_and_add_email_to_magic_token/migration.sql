-- AlterTable
ALTER TABLE "MagicToken" ADD COLUMN     "email" TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "username" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "MagicToken_email_idx" ON "MagicToken"("email");
