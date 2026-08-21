-- Convert "type" from the ServiceType enum to free text, preserving the
-- existing LSF/REMODELACAO values (unlike Prisma's auto-generated diff,
-- which would DROP + re-ADD the column and lose them).
ALTER TABLE "Service" ALTER COLUMN "type" TYPE TEXT USING "type"::TEXT;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "order" INTEGER NOT NULL DEFAULT 0;

-- DropEnum
DROP TYPE "ServiceType";

-- The admin identifier field now follows the lowercase slug convention
-- (matching Blog/Portfolio slugs), not the enum's original uppercase values.
UPDATE "Service" SET "type" = 'lsf', "order" = 0 WHERE "type" = 'LSF';
UPDATE "Service" SET "type" = 'remodelacao', "order" = 1 WHERE "type" = 'REMODELACAO';
