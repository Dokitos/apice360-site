-- A galeria do portefólio passa a aceitar vídeo além de fotografia. Tudo o
-- que lá está hoje é imagem, daí o valor por omissão.
ALTER TABLE "ProjectImage" ADD COLUMN "mediaType" TEXT NOT NULL DEFAULT 'IMAGE';
