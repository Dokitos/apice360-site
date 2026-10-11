import { parseImageDisplay, imageDisplayStyle } from "@/lib/image-display";

/**
 * Imagem vinda do painel, desenhada com o enquadramento que lá foi escolhido.
 *
 * O `className` continua a mandar no tamanho e na forma do espaço; o que esta
 * acrescenta é o `object-fit` e o `object-position` guardados no endereço (ver
 * src/lib/image-display.ts), e tirar o cardinal antes de o pôr no `src`.
 *
 * Usa `<img>` e não `next/image` pela mesma razão que o resto do site: as
 * imagens vêm do Vercel Blob com endereços que o painel escreve, sem largura
 * nem altura conhecidas à partida.
 */
export function SiteImage({
  src,
  alt = "",
  className,
  loading,
  fetchPriority,
}: {
  src: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
  fetchPriority?: "high" | "low" | "auto";
}) {
  const display = parseImageDisplay(src);
  if (!display.src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={display.src}
      alt={alt}
      className={className}
      style={imageDisplayStyle(display)}
      loading={loading}
      fetchPriority={fetchPriority}
    />
  );
}
