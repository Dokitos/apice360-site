-- Landing page (/lp): nova página gerível em "Secções de Página" + escalões
-- de preço por m² usados pelo simulador.

-- AlterEnum
ALTER TYPE "PageKey" ADD VALUE 'LP';

-- CreateTable
CREATE TABLE "LpPriceTier" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "pricePerM2" INTEGER NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isHighlighted" BOOLEAN NOT NULL DEFAULT false,
    "iconName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LpPriceTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LpPriceTierTranslation" (
    "id" TEXT NOT NULL,
    "tierId" TEXT NOT NULL,
    "locale" "Locale" NOT NULL,
    "isAutoTranslated" BOOLEAN NOT NULL DEFAULT false,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "features" TEXT,

    CONSTRAINT "LpPriceTierTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LpPriceTier_key_key" ON "LpPriceTier"("key");

-- CreateIndex
CREATE UNIQUE INDEX "LpPriceTierTranslation_tierId_locale_key" ON "LpPriceTierTranslation"("tierId", "locale");

-- AddForeignKey
ALTER TABLE "LpPriceTierTranslation" ADD CONSTRAINT "LpPriceTierTranslation_tierId_fkey" FOREIGN KEY ("tierId") REFERENCES "LpPriceTier"("id") ON DELETE CASCADE ON UPDATE CASCADE;
