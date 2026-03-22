-- CreateTable
CREATE TABLE "RallyStageSchedule" (
    "id" TEXT NOT NULL,
    "stageId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "startOrder" INTEGER NOT NULL,
    "scheduledStartTime" TIMESTAMP(3),
    "status" VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RallyStageSchedule_pkey" PRIMARY KEY ("id")
);

-- Backfill schedules for existing results
INSERT INTO "RallyStageSchedule" (
    "id",
    "stageId",
    "teamId",
    "startOrder",
    "scheduledStartTime",
    "status",
    "createdById",
    "updatedById",
    "createdAt",
    "updatedAt"
)
SELECT
    SUBSTRING(md5(rsr."stageId" || ':' || rsr."teamId") FROM 1 FOR 8) ||
    '-' ||
    SUBSTRING(md5(rsr."stageId" || ':' || rsr."teamId") FROM 9 FOR 4) ||
    '-' ||
    SUBSTRING(md5(rsr."stageId" || ':' || rsr."teamId") FROM 13 FOR 4) ||
    '-' ||
    SUBSTRING(md5(rsr."stageId" || ':' || rsr."teamId") FROM 17 FOR 4) ||
    '-' ||
    SUBSTRING(md5(rsr."stageId" || ':' || rsr."teamId") FROM 21 FOR 12) AS "id",
    rsr."stageId",
    rsr."teamId",
    ROW_NUMBER() OVER (
        PARTITION BY rsr."stageId"
        ORDER BY rsr."startTime" ASC, rsr."createdAt" ASC, rsr."id" ASC
    ) AS "startOrder",
    rsr."startTime" AS "scheduledStartTime",
    CASE
        WHEN rsr."status" IN ('OK', 'DNF', 'DNS', 'DSQ') THEN 'FINISHED'
        ELSE 'SCHEDULED'
    END AS "status",
    rsr."createdById",
    rsr."updatedById",
    rsr."createdAt",
    COALESCE(rsr."createdAt", CURRENT_TIMESTAMP)
FROM "RallyStageResult" rsr;

-- AlterTable
ALTER TABLE "RallyStageResult"
ADD COLUMN "scheduleId" TEXT;

UPDATE "RallyStageResult" rsr
SET "scheduleId" = rss."id"
FROM "RallyStageSchedule" rss
WHERE rss."stageId" = rsr."stageId"
  AND rss."teamId" = rsr."teamId";

ALTER TABLE "RallyStageResult"
ALTER COLUMN "scheduleId" SET NOT NULL;

-- Drop old constraints and columns
ALTER TABLE "RallyStageResult" DROP CONSTRAINT "RallyStageResult_stageId_fkey";
ALTER TABLE "RallyStageResult" DROP CONSTRAINT "RallyStageResult_teamId_fkey";
DROP INDEX "RallyStageResult_stageId_teamId_key";

ALTER TABLE "RallyStageResult"
DROP COLUMN "stageId",
DROP COLUMN "teamId";

-- CreateIndex
CREATE UNIQUE INDEX "RallyStageSchedule_stageId_teamId_key" ON "RallyStageSchedule"("stageId", "teamId");
CREATE UNIQUE INDEX "RallyStageSchedule_stageId_startOrder_key" ON "RallyStageSchedule"("stageId", "startOrder");
CREATE UNIQUE INDEX "RallyStageResult_scheduleId_key" ON "RallyStageResult"("scheduleId");

-- AddForeignKey
ALTER TABLE "RallyStageSchedule"
ADD CONSTRAINT "RallyStageSchedule_stageId_fkey" FOREIGN KEY ("stageId") REFERENCES "RallyStage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RallyStageSchedule"
ADD CONSTRAINT "RallyStageSchedule_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RallyStageResult"
ADD CONSTRAINT "RallyStageResult_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "RallyStageSchedule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
