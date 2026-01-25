-- DropIndex
DROP INDEX "RefreshSession_userId_idx";

-- AlterTable
ALTER TABLE "RefreshSession" ADD COLUMN     "tokenId" TEXT;

-- CreateIndex
CREATE INDEX "RefreshSession_userId_tokenId_idx" ON "RefreshSession"("userId", "tokenId");
