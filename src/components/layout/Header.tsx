import Link from "next/link";
import { getCta } from "@/lib/content";
import { NAV_LINKS } from "@/lib/nav";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { RandomLetterSwap } from "@/components/ui/RandomLetterSwap";
import { MobileNav } from "@/components/layout/MobileNav";

export async function Header() {
  const budgetCta = await getCta("header_budget");

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/40 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between gap-6 px-5 md:px-10">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-5 xl:flex 2xl:gap-7">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-[13px] font-medium tracking-wide text-on-surface-variant transition-colors hover:text-primary"
            >
              <RandomLetterSwap label={link.label} />
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 xl:block">
          {budgetCta ? (
            <Button href={budgetCta.url} variant="cta" size="sm">
              {budgetCta.label}
            </Button>
          ) : (
            <Button href="/contacto" variant="cta" size="sm">
              Faça seu Orçamento
            </Button>
          )}
        </div>

        <MobileNav ctaLabel={budgetCta?.label ?? "Faça seu Orçamento"} ctaUrl={budgetCta?.url ?? "/contacto"} />
      </div>
    </header>
  );
}
