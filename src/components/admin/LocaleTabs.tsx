"use client";

import { useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type LocaleTabsProps = {
  pt: ReactNode;
  en: ReactNode;
};

/**
 * Keeps both PT and EN field sets mounted (just visually hidden) so a single
 * native form submit carries every field regardless of which tab is active.
 */
export function LocaleTabs({ pt, en }: LocaleTabsProps) {
  const [active, setActive] = useState<"PT" | "EN">("PT");

  return (
    <div>
      <div className="mb-6 flex gap-2 border-b border-outline-variant/20">
        {(["PT", "EN"] as const).map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => setActive(locale)}
            className={cn(
              "px-4 py-2 font-mono text-label-mono uppercase tracking-widest transition-colors",
              active === locale
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-on-surface",
            )}
          >
            {locale}
          </button>
        ))}
      </div>
      <div className={active === "PT" ? "space-y-6" : "hidden"}>{pt}</div>
      <div className={active === "EN" ? "space-y-6" : "hidden"}>{en}</div>
    </div>
  );
}
