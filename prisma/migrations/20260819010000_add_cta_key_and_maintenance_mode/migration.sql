-- AlterTable
ALTER TABLE "PageSection" ADD COLUMN     "ctaKey" TEXT;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "maintenanceMode" BOOLEAN NOT NULL DEFAULT false;
