"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/app/(public)/actions/locale";
import { cn } from "@/lib/cn";
import type { SiteLocale } from "@/lib/locale";

export function LanguageSwitcher({ locale, className }: { locale: SiteLocale; className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function choose(next: SiteLocale) {
    if (next === locale || isPending) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
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
  );
}
