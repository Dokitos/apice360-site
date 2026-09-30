-- Interruptor do blog, a par dos que ja existem para a pagina LSF e a area
-- do arquiteto.
ALTER TABLE "SiteSettings" ADD COLUMN "blogEnabled" BOOLEAN NOT NULL DEFAULT true;
