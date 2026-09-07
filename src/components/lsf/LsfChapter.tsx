"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type LsfChapterProps = {
  id: string;
  /** Fundo do capítulo — alternar dá ritmo visual à sequência. */
  tone?: "light" | "muted" | "ink";
  /** `full` ocupa o ecrã inteiro (menos o cabeçalho); `auto` cresce com o conteúdo. */
  height?: "full" | "auto";
  className?: string;
  children: ReactNode;
};

const TONE_CLASSES: Record<NonNullable<LsfChapterProps["tone"]>, string> = {
  light: "bg-surface text-on-surface",
  muted: "bg-surface-container-lowest text-on-surface",
  ink: "bg-ink text-white",
};

/**
 * Um capítulo da página /lsf. Ocupa o ecrã, encaixa no scroll-snap (regra
 * .lsf-chapter em globals.css) e revela o conteúdo quando entra em cena —
 * os filhos marcados com `data-reveal` sobem e ganham opacidade, com o
 * atraso que cada um definir em `--reveal-delay`.
 *
 * A revelação é disparada uma única vez: reentrar num capítulo já lido não
 * volta a animar, o que seria cansativo ao percorrer a página para trás.
 */
export function LsfChapter({ id, tone = "light", height = "full", className, children }: LsfChapterProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      // Baixo o suficiente para disparar mal o capítulo assoma, e não só
      // quando já está quase todo no ecrã.
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      id={id}
      className={cn(
        "lsf-chapter relative flex w-full flex-col justify-center overflow-hidden",
        // 76px é a altura do cabeçalho fixo; svh evita o salto das barras
        // de endereço em iOS/Android.
        height === "full" && "min-h-[calc(100svh-76px)]",
        "px-5 py-24 md:px-20",
        TONE_CLASSES[tone],
        isVisible && "is-visible",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-site">{children}</div>
    </section>
  );
}

