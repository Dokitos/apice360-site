-- Página informativa /lsf: nova página gerível em "Secções de Página" e em
-- "SEO por Página", mais o interruptor que a mostra ou esconde do site.

-- AlterEnum
ALTER TYPE "PageKey" ADD VALUE 'LSF';

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN "lsfPageEnabled" BOOLEAN NOT NULL DEFAULT true;
