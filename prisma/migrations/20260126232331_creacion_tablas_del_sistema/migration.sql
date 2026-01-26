/*
  Warnings:

  - You are about to alter the column `userAgent` on the `RefreshSession` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `tokenId` on the `RefreshSession` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `code` on the `Role` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `name` on the `Role` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `email` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `name` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(150)`.
  - You are about to alter the column `status` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `provider` on the `UserIdentity` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `providerUserId` on the `UserIdentity` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `email` on the `UserIdentity` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterTable
ALTER TABLE "RefreshSession" ALTER COLUMN "userAgent" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "tokenId" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "Role" ALTER COLUMN "code" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(150);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "email" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "name" SET DATA TYPE VARCHAR(150),
ALTER COLUMN "status" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "UserIdentity" ALTER COLUMN "provider" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "providerUserId" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(255);

-- CreateTable
CREATE TABLE "Federation" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "acronym" VARCHAR(20) NOT NULL,
    "country" VARCHAR(100) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Federation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepartmentAssociation" (
    "id" TEXT NOT NULL,
    "federationId" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "department" VARCHAR(100) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepartmentAssociation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Championship" (
    "id" TEXT NOT NULL,
    "federationId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "modality" VARCHAR(20) NOT NULL,
    "season" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'PLANNED',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Championship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "championshipId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "modality" VARCHAR(20) NOT NULL,
    "allowsCodriver" BOOLEAN NOT NULL DEFAULT true,
    "pointsApply" BOOLEAN NOT NULL DEFAULT true,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Car" (
    "id" TEXT NOT NULL,
    "brand" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "year" INTEGER NOT NULL,
    "drivetrain" VARCHAR(50),
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Car_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarCategory" (
    "id" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "validFrom" TIMESTAMP(3) NOT NULL,
    "validTo" TIMESTAMP(3),
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "championshipId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "carId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "codriverId" TEXT,
    "competitionNo" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'INSCRIBED',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChampionshipCalendar" (
    "id" TEXT NOT NULL,
    "championshipId" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "eventName" VARCHAR(200) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChampionshipCalendar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModalidadFecha" (
    "id" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "modality" VARCHAR(20) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModalidadFecha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rally" (
    "id" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "totalKm" DOUBLE PRECISION,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rally_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RallyStage" (
    "id" TEXT NOT NULL,
    "rallyId" TEXT NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "stageType" VARCHAR(20) NOT NULL,
    "stageOrder" INTEGER NOT NULL,
    "distanceKm" DOUBLE PRECISION NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RallyStage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RallyStageResult" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "time" INTEGER NOT NULL,
    "penalty" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL DEFAULT 'OK',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RallyStageResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaceHeat" (
    "id" TEXT NOT NULL,
    "calendarId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "heatNumber" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RaceHeat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LapResult" (
    "id" TEXT NOT NULL,
    "heatId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "lapNo" INTEGER NOT NULL,
    "lapTime" INTEGER NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LapResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringSystem" (
    "id" TEXT NOT NULL,
    "championshipId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoringSystem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Federation_acronym_key" ON "Federation"("acronym");

-- CreateIndex
CREATE UNIQUE INDEX "CarCategory_carId_categoryId_validFrom_key" ON "CarCategory"("carId", "categoryId", "validFrom");

-- CreateIndex
CREATE UNIQUE INDEX "Team_championshipId_competitionNo_key" ON "Team"("championshipId", "competitionNo");

-- CreateIndex
CREATE UNIQUE INDEX "ChampionshipCalendar_championshipId_roundNumber_key" ON "ChampionshipCalendar"("championshipId", "roundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ModalidadFecha_calendarId_modality_key" ON "ModalidadFecha"("calendarId", "modality");

-- CreateIndex
CREATE UNIQUE INDEX "Rally_calendarId_key" ON "Rally"("calendarId");

-- CreateIndex
CREATE UNIQUE INDEX "RallyStageResult_stageId_teamId_key" ON "RallyStageResult"("stageId", "teamId");

-- CreateIndex
CREATE UNIQUE INDEX "LapResult_heatId_teamId_lapNo_key" ON "LapResult"("heatId", "teamId", "lapNo");

-- CreateIndex
CREATE UNIQUE INDEX "ScoringSystem_championshipId_categoryId_position_key" ON "ScoringSystem"("championshipId", "categoryId", "position");

-- AddForeignKey
ALTER TABLE "DepartmentAssociation" ADD CONSTRAINT "DepartmentAssociation_federationId_fkey" FOREIGN KEY ("federationId") REFERENCES "Federation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Championship" ADD CONSTRAINT "Championship_federationId_fkey" FOREIGN KEY ("federationId") REFERENCES "Federation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "Championship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarCategory" ADD CONSTRAINT "CarCategory_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarCategory" ADD CONSTRAINT "CarCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "Championship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team" ADD CONSTRAINT "Team_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChampionshipCalendar" ADD CONSTRAINT "ChampionshipCalendar_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "Championship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChampionshipCalendar" ADD CONSTRAINT "ChampionshipCalendar_associationId_fkey" FOREIGN KEY ("associationId") REFERENCES "DepartmentAssociation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModalidadFecha" ADD CONSTRAINT "ModalidadFecha_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "ChampionshipCalendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rally" ADD CONSTRAINT "Rally_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "ChampionshipCalendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RallyStage" ADD CONSTRAINT "RallyStage_rallyId_fkey" FOREIGN KEY ("rallyId") REFERENCES "Rally"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RallyStageResult" ADD CONSTRAINT "RallyStageResult_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "RallyStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RallyStageResult" ADD CONSTRAINT "RallyStageResult_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceHeat" ADD CONSTRAINT "RaceHeat_calendarId_fkey" FOREIGN KEY ("calendarId") REFERENCES "ChampionshipCalendar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceHeat" ADD CONSTRAINT "RaceHeat_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LapResult" ADD CONSTRAINT "LapResult_heatId_fkey" FOREIGN KEY ("heatId") REFERENCES "RaceHeat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LapResult" ADD CONSTRAINT "LapResult_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoringSystem" ADD CONSTRAINT "ScoringSystem_championshipId_fkey" FOREIGN KEY ("championshipId") REFERENCES "Championship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoringSystem" ADD CONSTRAINT "ScoringSystem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
