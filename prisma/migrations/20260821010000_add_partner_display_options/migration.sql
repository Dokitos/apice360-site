-- AlterTable
ALTER TABLE "Partner" ADD COLUMN     "cardSize" TEXT NOT NULL DEFAULT 'MD';

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "partnersDisplayMode" TEXT NOT NULL DEFAULT 'GRID';
