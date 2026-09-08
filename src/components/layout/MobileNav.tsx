"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { getNavLinks } from "@/lib/nav";
import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

type MobileNavProps = {
  locale: SiteLocale;
  ctaLabel?: string;
  ctaUrl?: string;
  showArchitectArea?: boolean;
  showLsfPage?: boolean;
  customPages?: { slug: string; navLabel: string }[];
};

export function MobileNav({
  locale,
  ctaLabel,
  ctaUrl,
  showArchitectArea = true,
  showLsfPage = true,
  customPages,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const dict = getDictionary(locale);
  const navLinks = getNavLinks(dict, { showArchitectArea, showLsfPage, customPages });

  return (
    <div className="min-[1360px]:hidden">
      <button
        type="button"
        aria-label={open ? dict.mobileNav.fecharMenu : dict.mobileNav.abrirMenu}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center text-on-surface"
      >
        <Icon name={open ? "close" : "menu"} className="text-3xl" />
      </button>

      {open ? (
        <div className="fixed inset-x-0 top-[76px] z-40 max-h-[calc(100vh-76px)] overflow-y-auto border-t border-black/5 bg-white/95 backdrop-blur-xl px-5 py-8 shadow-lg">
          <nav className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-[15px] font-medium uppercase tracking-wide text-on-surface transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <LanguageSwitcher locale={locale} className="mt-8" />
          {ctaLabel && ctaUrl ? (
            <Button href={ctaUrl} variant="cta" className="mt-4 w-full">
              {ctaLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
