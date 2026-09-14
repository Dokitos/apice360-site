"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

/**
 * Citação de um testemunho com corte a 8 linhas e botão "Ver mais".
 *
 * Há testemunhos de duas linhas e outros de vinte; sem corte, o cartão mais
 * longo estica todos os outros do carrossel e deixa-os com um vazio enorme
 * por baixo do texto. O botão só aparece quando o texto é mesmo cortado —
 * medimos em vez de contar caracteres, porque o mesmo texto ocupa linhas
 * diferentes em mobile e em desktop.
 */
export function TestimonialQuote({
  quote,
  moreLabel,
  lessLabel,
}: {
  quote: string;
  moreLabel: string;
  lessLabel: string;
}) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClamped, setIsClamped] = useState(false);

  const measure = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    // Só é fiável com o corte aplicado; por isso a medição acontece sempre
    // no estado recolhido (ver a dependência de isExpanded abaixo).
    setIsClamped(node.scrollHeight - node.clientHeight > 1);
  }, []);

  useEffect(() => {
    if (isExpanded) return;
    measure();

    const node = ref.current;
    if (!node || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [measure, isExpanded]);

  return (
    <div className="mb-8">
      <p
        ref={ref}
        className={cn("italic leading-relaxed text-on-surface", !isExpanded && "line-clamp-[8]")}
      >
        &ldquo;{quote}&rdquo;
      </p>

      {isClamped ? (
        <button
          type="button"
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
          className="mt-3 inline-flex items-center gap-1 font-mono text-label-mono uppercase tracking-widest text-primary transition-colors hover:text-primary-deep"
        >
          {isExpanded ? lessLabel : moreLabel}
          <Icon
            name="expand_more"
            className={cn("text-base transition-transform", isExpanded && "rotate-180")}
          />
        </button>
      ) : null}
    </div>
  );
}
