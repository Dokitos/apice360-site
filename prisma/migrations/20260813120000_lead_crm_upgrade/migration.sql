-- CreateEnum
CREATE TYPE "LeadActivityType" AS ENUM ('STATUS_CHANGE', 'NOTE', 'CALL_LOGGED', 'EMAIL_LOGGED', 'ASSIGNMENT');

-- AlterEnum (LeadStatus: NEW, CONTACTED, CLOSED -> NEW, CONTACTED, QUALIFIED, WON, LOST)
-- No existing rows use 'CLOSED', so this is a straight recreate, no data mapping needed.
ALTER TYPE "LeadStatus" RENAME TO "LeadStatus_old";
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'WON', 'LOST');
ALTER TABLE "LeadSubmission" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "LeadSubmission" ALTER COLUMN "status" TYPE "LeadStatus" USING ("status"::text::"LeadStatus");
ALTER TABLE "LeadSubmission" ALTER COLUMN "status" SET DEFAULT 'NEW';
DROP TYPE "LeadStatus_old";

-- AlterTable
ALTER TABLE "LeadSubmission" ADD COLUMN "notes" TEXT,
ADD COLUMN "assignedToId" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "LeadSubmission" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "LeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" "LeadActivityType" NOT NULL,
    "note" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadSubmission_status_idx" ON "LeadSubmission"("status");

-- CreateIndex
CREATE INDEX "LeadSubmission_type_idx" ON "LeadSubmission"("type");

-- CreateIndex
CREATE INDEX "LeadSubmission_createdAt_idx" ON "LeadSubmission"("createdAt");

-- CreateIndex
CREATE INDEX "LeadSubmission_assignedToId_idx" ON "LeadSubmission"("assignedToId");

-- CreateIndex
CREATE INDEX "LeadActivity_leadId_idx" ON "LeadActivity"("leadId");

-- AddForeignKey
ALTER TABLE "LeadSubmission" ADD CONSTRAINT "LeadSubmission_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "LeadSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
