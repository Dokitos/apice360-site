"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";

export type DeckChapter = { id: string; title: string };

/**
 * Casca da página /lsf: liga o modo "slide" e desenha os dois indicadores
 * que dizem ao visitante onde está — a barra de progresso no topo e a
 * coluna de pontos à direita, que também navega.
 *
 * O scroll-snap vive numa classe posta no <html> só enquanto esta página
 * está montada, para não afetar o resto do site (regras em globals.css).
 */
export function LsfDeck({
  chapters,
  locale,
  children,
}: {
  chapters: DeckChapter[];
  locale: SiteLocale;
  children: ReactNode;
}) {
  const dict = getDictionary(locale);
  const t = dict.lsfPage;
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add("lsf-deck");
    return () => document.documentElement.classList.remove("lsf-deck");
  }, []);

  useEffect(() => {
    // O capítulo ativo é o que cobre a linha média do ecrã — mais estável do
    // que usar interseção pura, que oscila quando dois capítulos são visíveis.
    function onScroll() {
      const middle = window.scrollY + window.innerHeight / 2;
      let current = 0;
      chapters.forEach((chapter, index) => {
        const node = document.getElementById(chapter.id);
        if (node && node.offsetTop <= middle) current = index;
      });
      setActiveIndex(current);

      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0);
    }

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [chapters]);

  function goTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <div
        role="progressbar"
        aria-label={t.readingProgress}
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="fixed inset-x-0 top-[76px] z-40 h-1 bg-transparent"
      >
        <div
          className="h-full origin-left bg-primary transition-[width] duration-150 ease-out"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {/* Só a partir de lg: em ecrãs estreitos a coluna roubaria largura ao texto. */}
      <nav
        aria-label={t.chaptersNav}
        className="fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-3 lg:flex"
      >
        {chapters.map((chapter, index) => (
          <button
            key={chapter.id}
            type="button"
            onClick={() => goTo(chapter.id)}
            aria-label={t.goToChapter(chapter.title)}
            aria-current={index === activeIndex}
            className="group flex items-center gap-3"
          >
            <span
              className={cn(
                "whitespace-nowrap rounded-full bg-ink/85 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white opacity-0 transition-opacity",
                "group-hover:opacity-100 group-focus-visible:opacity-100",
              )}
            >
              {chapter.title}
            </span>
            <span
              className={cn(
                "block rounded-full transition-all",
                index === activeIndex
                  ? "h-6 w-1.5 bg-primary"
                  : "h-1.5 w-1.5 bg-on-surface-variant/40 group-hover:bg-primary/60",
              )}
            />
          </button>
        ))}
      </nav>

      {children}
    </>
  );
}

/** Indicador "Capítulo X de Y" + seta, usado no fundo dos capítulos. */
export function LsfChapterMarker({
  locale,
  current,
  total,
  className,
}: {
  locale: SiteLocale;
  current: number;
  total: number;
  className?: string;
}) {
  const dict = getDictionary(locale);
  return (
    <span className={cn("font-mono text-[10px] uppercase tracking-[0.25em] opacity-60", className)}>
      {dict.lsfPage.chapterOf(current, total)}
    </span>
  );
}
