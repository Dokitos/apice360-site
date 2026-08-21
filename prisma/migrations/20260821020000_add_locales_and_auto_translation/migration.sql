-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Locale" ADD VALUE 'ES';
ALTER TYPE "Locale" ADD VALUE 'FR';

-- AlterTable
ALTER TABLE "BlogCategoryTranslation" ADD COLUMN     "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "BlogPostTranslation" ADD COLUMN     "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "CtaTranslation" ADD COLUMN     "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PageSectionItemTranslation" ADD COLUMN     "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PageSectionTranslation" ADD COLUMN     "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PageSeoTranslation" ADD COLUMN     "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ProjectTranslation" ADD COLUMN     "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ServiceFeatureTranslation" ADD COLUMN     "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ServiceTranslation" ADD COLUMN     "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SiteSettingsTranslation" ADD COLUMN     "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "StatTranslation" ADD COLUMN     "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TestimonialTranslation" ADD COLUMN     "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false;
