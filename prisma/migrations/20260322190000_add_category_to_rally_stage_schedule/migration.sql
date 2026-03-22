ALTER TABLE "RallyStageSchedule"
ADD COLUMN "categoryId" TEXT;

UPDATE "RallyStageSchedule" rss
SET "categoryId" = t."categoryId"
FROM "Team" t
WHERE t."id" = rss."teamId";

ALTER TABLE "RallyStageSchedule"
ALTER COLUMN "categoryId" SET NOT NULL;

DROP INDEX "RallyStageSchedule_stageId_startOrder_key";

CREATE UNIQUE INDEX "RallyStageSchedule_stageId_categoryId_startOrder_key"
ON "RallyStageSchedule"("stageId", "categoryId", "startOrder");

ALTER TABLE "RallyStageSchedule"
ADD CONSTRAINT "RallyStageSchedule_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
