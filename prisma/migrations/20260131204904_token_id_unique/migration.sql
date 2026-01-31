/*
  Warnings:

  - You are about to drop the `ModalidadFecha` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[federationId,name,season]` on the table `Championship` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[federationId,name]` on the table `DepartmentAssociation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[tokenId]` on the table `RefreshSession` will be added. If there are existing duplicate values, this will fail.
  - Made the column `tokenId` on table `RefreshSession` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "ModalidadFecha" DROP CONSTRAINT "ModalidadFecha_calendarId_fkey";

-- AlterTable
ALTER TABLE "RefreshSession" ALTER COLUMN "tokenId" SET NOT NULL;

-- DropTable
DROP TABLE "ModalidadFecha";

-- CreateIndex
CREATE UNIQUE INDEX "Championship_federationId_name_season_key" ON "Championship"("federationId", "name", "season");

-- CreateIndex
CREATE UNIQUE INDEX "DepartmentAssociation_federationId_name_key" ON "DepartmentAssociation"("federationId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshSession_tokenId_key" ON "RefreshSession"("tokenId");

-- CreateIndex
CREATE INDEX "RefreshSession_tokenId_revokedAt_expiresAt_idx" ON "RefreshSession"("tokenId", "revokedAt", "expiresAt");
