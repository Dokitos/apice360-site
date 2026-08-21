"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

type SecondaryLocale = "EN" | "ES" | "FR";

type LocaleTabsProps = {
  pt: ReactNode;
  en: ReactNode;
  es: ReactNode;
  fr: ReactNode;
  /** Which of EN/ES/FR currently hold machine-translated text (not hand-edited) — shows a badge. */
  autoTranslated?: Partial<Record<SecondaryLocale, boolean>>;
};

const SECONDARY_LOCALES: SecondaryLocale[] = ["EN", "ES", "FR"];

/**
 * PT is the required source language, so it's shown directly rather than as
 * a tab. EN/ES/FR are auto-filled by DeepL on save (see
 * src/lib/auto-translate.ts) and sit behind a collapsible "Traduções"
 * section for review/manual override. Every locale's fields stay mounted at
 * all times (only ever CSS-hidden, never unmounted) so one native form
 * submit carries every language regardless of which tab/section is open.
 */
export function LocaleTabs({ pt, en, es, fr, autoTranslated }: LocaleTabsProps) {
  const [translationsOpen, setTranslationsOpen] = useState(false);
  const [active, setActive] = useState<SecondaryLocale>("EN");
  const content: Record<SecondaryLocale, ReactNode> = { EN: en, ES: es, FR: fr };

  return (
    <div className="space-y-6">
      <div className="space-y-6">{pt}</div>

      <div className="rounded-lg border border-outline-variant/30">
        <button
          type="button"
          onClick={() => setTranslationsOpen((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <span className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
            Traduções (EN · ES · FR)
          </span>
          <Icon
            name={translationsOpen ? "expand_less" : "expand_more"}
            className="text-on-surface-variant"
          />
        </button>

        <div className={cn("border-t border-outline-variant/30 p-4", !translationsOpen && "hidden")}>
          <div className="mb-6 flex gap-2 border-b border-outline-variant/20">
            {SECONDARY_LOCALES.map((locale) => (
              <button
                key={locale}
                type="button"
                onClick={() => setActive(locale)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 font-mono text-label-mono uppercase tracking-widest transition-colors",
                  active === locale
                    ? "border-b-2 border-primary text-primary"
                    : "text-on-surface-variant hover:text-on-surface",
                )}
              >
                {locale}
                {autoTranslated?.[locale] ? (
                  <span title="Traduzido automaticamente" className="text-sm">
                    🤖
                  </span>
                ) : null}
              </button>
            ))}
          </div>
          {SECONDARY_LOCALES.map((locale) => (
            <div key={locale} className={active === locale ? "space-y-6" : "hidden"}>
              {content[locale]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
