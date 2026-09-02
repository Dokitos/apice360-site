"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/(public)/actions/locale";
import { cn } from "@/lib/cn";
import { getDictionary } from "@/lib/dictionary";
import { SITE_LOCALES, type SiteLocale } from "@/lib/site-locales";

type LanguageSwitcherProps = {
  locale: SiteLocale;
  className?: string;
  /**
   * "pill" mostra os quatro idiomas lado a lado (usado na gaveta mobile,
   * onde há espaço de sobra); "compact" mostra só o idioma ativo e abre a
   * lista ao clicar — no cabeçalho, com o menu a 18px, os quatro códigos
   * roubavam ~100px que fazem falta aos links.
   */
  variant?: "pill" | "compact";
};

export function LanguageSwitcher({ locale, className, variant = "pill" }: LanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingLocale, setPendingLocale] = useState<SiteLocale | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function choose(next: SiteLocale) {
    setOpen(false);
    if (next === locale || isPending) return;
    setPendingLocale(next);
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  // Fecha a lista ao clicar fora ou com Escape.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const overlayDict = getDictionary(pendingLocale ?? locale);

  return (
    <>
      {variant === "compact" ? (
        <div ref={containerRef} className={cn("relative", className)}>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-label={`Idioma: ${locale}`}
            className={cn(
              "flex items-center gap-1 rounded-full border border-outline-variant/40 px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-widest text-on-surface-variant transition-colors hover:border-primary hover:text-primary",
              isPending && "opacity-60",
            )}
          >
            <span className="material-symbols-outlined text-base leading-none" aria-hidden="true">
              language
            </span>
            {locale}
          </button>

          {open ? (
            <div
              role="listbox"
              className="absolute right-0 top-full z-50 mt-2 flex min-w-[5rem] flex-col overflow-hidden rounded-lg border border-outline-variant/40 bg-surface shadow-lg"
            >
              {SITE_LOCALES.map((code) => (
                <button
                  key={code}
                  type="button"
                  role="option"
                  aria-selected={locale === code}
                  onClick={() => choose(code)}
                  className={cn(
                    "px-4 py-2 text-left font-mono text-[11px] font-bold uppercase tracking-widest transition-colors",
                    locale === code
                      ? "bg-primary text-on-primary"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-primary",
                  )}
                >
                  {code}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        <div
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-outline-variant/40 p-0.5 font-mono text-[11px] font-bold uppercase tracking-widest",
            isPending && "opacity-60",
            className,
          )}
        >
          {SITE_LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => choose(code)}
              aria-current={locale === code}
              className={cn(
                "rounded-full px-2.5 py-1 transition-colors",
                locale === code ? "bg-primary text-on-primary" : "text-on-surface-variant hover:text-primary",
              )}
            >
              {code}
            </button>
          ))}
        </div>
      )}

      {isPending
        ? createPortal(
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-surface/90 backdrop-blur-sm">
              <div className="relative flex h-16 w-16 items-center justify-center">
                <span className="absolute inset-0 animate-spin rounded-full border-4 border-outline-variant/30 border-t-primary" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/logo-360.png"
                  alt=""
                  className="h-9 w-9 animate-pulse-glow rounded-md object-contain"
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
