-- IDs de tracking geridos pelo painel, em vez de variáveis de ambiente: o
-- cliente troca-os sem um novo deploy, e a landing page e o site partilham
-- os mesmos valores.
ALTER TABLE "SiteSettings" ADD COLUMN "gaMeasurementId" TEXT;
ALTER TABLE "SiteSettings" ADD COLUMN "metaPixelId" TEXT;
