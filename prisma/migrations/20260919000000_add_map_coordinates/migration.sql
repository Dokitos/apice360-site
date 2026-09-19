-- O ponto do mapa dos contactos estava escrito no código, numa Rua Bento
-- Gonçalves de Fernão Ferro em vez da de Amora. Passa a ser conteúdo.
ALTER TABLE "SiteSettings" ADD COLUMN "mapLatitude" DOUBLE PRECISION;
ALTER TABLE "SiteSettings" ADD COLUMN "mapLongitude" DOUBLE PRECISION;
