ALTER TABLE "RallyStageResult"
ADD COLUMN "startTime" TIMESTAMP(3),
ADD COLUMN "endTime" TIMESTAMP(3);

UPDATE "RallyStageResult"
SET
  "startTime" = "createdAt",
  "endTime" = "createdAt" + ("time" * INTERVAL '1 millisecond')
WHERE "startTime" IS NULL OR "endTime" IS NULL;

ALTER TABLE "RallyStageResult"
ALTER COLUMN "startTime" SET NOT NULL,
ALTER COLUMN "endTime" SET NOT NULL;
