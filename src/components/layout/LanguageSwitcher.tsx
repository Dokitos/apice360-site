"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/(public)/actions/locale";
import { cn } from "@/lib/cn";
import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";

export function LanguageSwitcher({ locale, className }: { locale: SiteLocale; className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingLocale, setPendingLocale] = useState<SiteLocale | null>(null);

  function choose(next: SiteLocale) {
    if (next === locale || isPending) return;
    setPendingLocale(next);
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  const overlayDict = getDictionary(pendingLocale ?? locale);

  return (
    <>
      <div
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-outline-variant/40 p-0.5 font-mono text-[11px] font-bold uppercase tracking-widest",
          isPending && "opacity-60",
          className,
        )}
      >
        <button
          type="button"
          onClick={() => choose("PT")}
          aria-current={locale === "PT"}
          className={cn(
            "rounded-full px-2.5 py-1 transition-colors",
            locale === "PT" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-primary",
          )}
        >
          PT
        </button>
        <button
          type="button"
          onClick={() => choose("EN")}
          aria-current={locale === "EN"}
          className={cn(
            "rounded-full px-2.5 py-1 transition-colors",
            locale === "EN" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-primary",
          )}
        >
          EN
        </button>
      </div>

      {isPending
        ? createPortal(
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-surface/90 backdrop-blur-sm">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <span className="absolute inset-0 animate-spin rounded-full border-4 border-outline-variant/30 border-t-primary" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo.png"
                  alt=""
                  className="h-9 w-9 animate-pulse-glow rounded-md object-cover"
                />
              </div>
              <span className="font-mono text-xs uppercase tracking-widest text-on-surface-variant">
                {overlayDict.header.aTraduzir}
              </span>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
