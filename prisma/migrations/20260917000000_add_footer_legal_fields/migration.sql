-- A linha legal e a tagline do rodapé estavam escritas no dicionário, onde só
-- se mudam com um deploy. Passam a ser conteúdo, traduzível como o resto.
ALTER TABLE "SiteSettingsTranslation" ADD COLUMN "footerLegal" TEXT;
ALTER TABLE "SiteSettingsTranslation" ADD COLUMN "footerTagline" TEXT;
