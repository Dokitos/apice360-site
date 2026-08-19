-- AlterTable
ALTER TABLE "LeadSubmission" ADD COLUMN     "refNumber" SERIAL NOT NULL;

-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "LeadSubmission_refNumber_key" ON "LeadSubmission"("refNumber");
