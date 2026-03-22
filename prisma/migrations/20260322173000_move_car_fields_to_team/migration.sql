ALTER TABLE "Team"
ADD COLUMN "carBrand" VARCHAR(100),
ADD COLUMN "carModel" VARCHAR(100),
ADD COLUMN "carYear" INTEGER;

UPDATE "Team" t
SET
  "carBrand" = c."brand",
  "carModel" = c."model",
  "carYear" = c."year"
FROM "Car" c
WHERE c."id" = t."carId";

ALTER TABLE "Team"
ALTER COLUMN "carBrand" SET NOT NULL;

ALTER TABLE "Team"
DROP CONSTRAINT "Team_carId_fkey";

ALTER TABLE "Team"
DROP COLUMN "carId";
