"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Button } from "@/components/ui/Button";
import { NAV_LINKS } from "@/lib/nav";

type MobileNavProps = {
  ctaLabel?: string;
  ctaUrl?: string;
};

export function MobileNav({ ctaLabel, ctaUrl }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-10 items-center justify-center text-on-surface"
      >
        <Icon name={open ? "close" : "menu"} className="text-3xl" />
      </button>

      {open ? (
        <div className="fixed inset-x-0 top-[76px] z-40 max-h-[calc(100vh-76px)] overflow-y-auto border-t border-black/5 bg-white/95 backdrop-blur-xl px-5 py-8 shadow-lg">
          <nav className="flex flex-col gap-6">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-mono text-label-mono uppercase tracking-widest text-on-surface transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          {ctaLabel && ctaUrl ? (
            <Button href={ctaUrl} variant="cta" className="mt-8 w-full">
              {ctaLabel}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
