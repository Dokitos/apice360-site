import Link from "next/link";
import { getCta } from "@/lib/content";
import { NAV_LINKS } from "@/lib/nav";
import { Button } from "@/components/ui/Button";
import { MobileNav } from "@/components/layout/MobileNav";

export async function Header() {
  const budgetCta = await getCta("header_budget");

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-outline-variant/10">
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center justify-between px-5 md:px-20">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-heading text-headline-md font-bold tracking-tighter text-primary">
            ÁPICE 360
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          {budgetCta ? (
            <Button href={budgetCta.url} variant="cta-outline" size="md">
              {budgetCta.label}
            </Button>
          ) : (
            <Button href="/contacto" variant="cta-outline" size="md">
              Faça seu Orçamento
            </Button>
          )}
        </div>

        <MobileNav ctaLabel={budgetCta?.label ?? "Faça seu Orçamento"} ctaUrl={budgetCta?.url ?? "/contacto"} />
      </div>
    </header>
  );
}
