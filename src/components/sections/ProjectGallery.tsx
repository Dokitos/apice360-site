"use client";

import { useCallback, useEffect, useState } from "react";
import { Carousel } from "@/components/ui/Carousel";
import { Icon } from "@/components/ui/Icon";

export type GalleryMediaItem = {
  id: string;
  url: string;
  alt: string | null;
  mediaType: string;
};

/**
 * Galeria de um projeto: carrossel que abre em ecrã inteiro ao clicar.
 *
 * No carrossel as peças são recortadas a 16:10 para a fila ficar alinhada;
 * aberto, passa a object-contain — é lá que se vê a fotografia inteira, que
 * é justamente o que o recorte esconde.
 */
export function ProjectGallery({ items, title }: { items: GalleryMediaItem[]; title: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const isOpen = openIndex !== null;

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (delta: number) => setOpenIndex((i) => (i === null ? i : (i + delta + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (!isOpen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    }
    document.addEventListener("keydown", onKey);
    // Sem isto a página continua a deslizar por trás da sobreposição.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, close, step]);

  if (items.length === 0) return null;

  const active = openIndex === null ? null : items[openIndex];

  return (
    <>
      <div className="mb-12 xl:-mx-[140px]">
        <Carousel slideClassName="flex-[0_0_100%]">
          {items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setOpenIndex(index)}
              aria-label={`Ampliar ${item.alt ?? title}`}
              className="group relative block w-full cursor-zoom-in overflow-hidden rounded-lg"
            >
              {item.mediaType === "VIDEO" ? (
                <video
                  src={item.url}
                  muted
                  playsInline
                  preload="metadata"
                  className="aspect-[16/10] w-full bg-black object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt={item.alt ?? title} className="aspect-[16/10] w-full object-cover" />
              )}
              <span className="absolute inset-0 bg-ink/0 transition-colors group-hover:bg-ink/20" />
              <span className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <Icon name={item.mediaType === "VIDEO" ? "play_arrow" : "zoom_in"} />
              </span>
            </button>
          ))}
        </Carousel>
      </div>

      {active ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={active.alt ?? title}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/95 p-4 md:p-10"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fechar"
            className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <Icon name="close" />
          </button>

          {items.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Anterior"
                onClick={(e) => {
                  e.stopPropagation();
                  step(-1);
                }}
                className="absolute left-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:left-6"
              >
                <Icon name="chevron_left" />
              </button>
              <button
                type="button"
                aria-label="Seguinte"
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-3 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:right-6"
              >
                <Icon name="chevron_right" />
              </button>
            </>
          ) : null}

          {/* Parar a propagação: clicar na própria peça não deve fechar. */}
          <div className="max-h-full w-full max-w-6xl" onClick={(e) => e.stopPropagation()}>
            {active.mediaType === "VIDEO" ? (
              <video
                key={active.id}
                src={active.url}
                controls
                autoPlay
                playsInline
                className="mx-auto max-h-[85vh] w-auto max-w-full rounded-lg"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={active.id}
                src={active.url}
                alt={active.alt ?? title}
                className="mx-auto max-h-[85vh] w-auto max-w-full rounded-lg object-contain"
              />
            )}
            {active.alt ? (
              <p className="mt-4 text-center text-sm text-white/70">{active.alt}</p>
            ) : null}
          </div>

          <span className="absolute bottom-5 left-1/2 -translate-x-1/2 font-mono text-xs uppercase tracking-widest text-white/60">
            {(openIndex ?? 0) + 1} / {items.length}
          </span>
        </div>
      ) : null}
    </>
  );
}
