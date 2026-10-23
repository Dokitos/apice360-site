-- Inscricoes na newsletter (rodape e simulador) e o consentimento de
-- marketing recolhido no formulario que originou cada lead.

-- AlterTable
ALTER TABLE "LeadSubmission" ADD COLUMN "marketingConsent" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "locale" "Locale" NOT NULL DEFAULT 'PT',
    "source" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "unsubscribedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_isActive_idx" ON "NewsletterSubscriber"("isActive");
