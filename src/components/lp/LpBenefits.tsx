"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";

type BenefitItem = {
  id: string;
  iconName: string | null;
  title: string;
  body: string | null;
};

/**
 * Grelha de cartões que rodam: em desktop o hover chega (CSS), em ecrãs
 * táteis o toque alterna a classe .is-flipped — daí este ser um componente
 * de cliente. Os cartões vêm todos da secção "benefits" do admin.
 */
export function LpBenefits({
  locale,
  heading,
  subheading,
  items,
}: {
  locale: SiteLocale;
  heading: string;
  subheading?: string | null;
  items: BenefitItem[];
}) {
  const dict = getDictionary(locale);
  const [flipped, setFlipped] = useState<string | null>(null);

  if (items.length === 0) return null;

  return (
    <Reveal as="section" id="benefits" className="relative z-20 bg-surface-container-lowest pb-16 pt-20 md:pb-24 md:pt-28">
      <div className="relative z-10 mx-auto max-w-site px-5 md:px-20">
        <div className="mb-12 text-center md:mb-16">
          <h2 className="mb-6 font-heading text-headline-lg">{heading}</h2>
          <div className="mx-auto h-1 w-24 rounded-full bg-primary" />
          {subheading ? (
            <p className="mx-auto mt-6 max-w-2xl text-on-surface-variant">{subheading}</p>
          ) : null}
          <p className="mt-4 font-mono text-xs uppercase tracking-widest text-on-surface-variant/70">
            {dict.lp.flipHint}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFlipped((current) => (current === item.id ? null : item.id))}
              aria-label={item.title}
              className={cn("flip-card h-64 cursor-pointer text-left md:h-72", flipped === item.id && "is-flipped")}
            >
              <span className="flip-card-inner block">
                <span className="flip-card-front neon-border flex flex-col items-center justify-center rounded-2xl bg-surface-container-low p-6 text-center">
                  <Icon name={item.iconName ?? "check_circle"} className="mb-3 text-3xl text-primary" />
                  <span className="text-base font-bold leading-tight">{item.title}</span>
                </span>
                <span className="flip-card-back flex flex-col items-center justify-center rounded-2xl bg-primary p-5 text-center">
                  <span className="text-[13px] leading-relaxed text-white md:text-sm">{item.body}</span>
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </Reveal>
  );
}
