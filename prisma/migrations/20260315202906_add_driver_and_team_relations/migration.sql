-- DropForeignKey
ALTER TABLE "Team" DROP CONSTRAINT "Team_codriverId_fkey";

-- AlterTable
ALTER TABLE "Driver" ALTER COLUMN "birthDate" SET DATA TYPE DATE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_codriverId_fkey" FOREIGN KEY ("codriverId") REFERENCES "Driver"("id") ON DELETE SET NULL ON UPDATE CASCADE;
