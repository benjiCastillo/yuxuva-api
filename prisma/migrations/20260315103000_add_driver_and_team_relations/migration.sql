-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "firstName" VARCHAR(100) NOT NULL,
    "lastName" VARCHAR(100) NOT NULL,
    "documentType" VARCHAR(30),
    "documentNumber" VARCHAR(50),
    "licenseNumber" VARCHAR(50),
    "nationality" VARCHAR(100),
    "birthDate" TIMESTAMP(3),
    "phone" VARCHAR(30),
    "email" VARCHAR(255),
    "bloodType" VARCHAR(10),
    "address" TEXT,
    "photoUrl" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    "createdById" TEXT NOT NULL,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Driver_documentNumber_key" ON "Driver"("documentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_licenseNumber_key" ON "Driver"("licenseNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_email_key" ON "Driver"("email");

-- CreateIndex
CREATE INDEX "Team_driverId_idx" ON "Team"("driverId");

-- CreateIndex
CREATE INDEX "Team_codriverId_idx" ON "Team"("codriverId");

-- AddForeignKey
ALTER TABLE "Team"
ADD CONSTRAINT "Team_driverId_fkey"
FOREIGN KEY ("driverId") REFERENCES "Driver"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Team"
ADD CONSTRAINT "Team_codriverId_fkey"
FOREIGN KEY ("codriverId") REFERENCES "Driver"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
