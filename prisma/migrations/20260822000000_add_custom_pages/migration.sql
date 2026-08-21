-- AlterTable
ALTER TABLE "PageSection" ADD COLUMN     "customPageId" TEXT,
ALTER COLUMN "page" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CustomPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "showInMenu" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomPageTranslation" (
    "id" TEXT NOT NULL,
    "customPageId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false,
    "navLabel" TEXT NOT NULL,
    "heading" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,

    CONSTRAINT "CustomPageTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CustomPage_slug_key" ON "CustomPage"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CustomPageTranslation_customPageId_locale_key" ON "CustomPageTranslation"("customPageId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "PageSection_customPageId_key_key" ON "PageSection"("customPageId", "key");

-- AddForeignKey
ALTER TABLE "PageSection" ADD CONSTRAINT "PageSection_customPageId_fkey" FOREIGN KEY ("customPageId") REFERENCES "CustomPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomPageTranslation" ADD CONSTRAINT "CustomPageTranslation_customPageId_fkey" FOREIGN KEY ("customPageId") REFERENCES "CustomPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
