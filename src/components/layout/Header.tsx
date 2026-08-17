import Link from "next/link";
import { getCta } from "@/lib/content";
import { getNavLinks } from "@/lib/nav";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/dictionary";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { RandomLetterSwap } from "@/components/ui/RandomLetterSwap";
import { MobileNav } from "@/components/layout/MobileNav";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export async function Header() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const budgetCta = await getCta("header_budget", locale);
  const navLinks = getNavLinks(dict);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1600px] items-center justify-between gap-6 px-5 md:px-10">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-5 xl:flex 2xl:gap-7">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-[13px] font-medium tracking-wide text-on-surface-variant transition-colors hover:text-primary"
            >
              <RandomLetterSwap key={link.label} label={link.label} />
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-4 xl:flex">
          <LanguageSwitcher locale={locale} />
          {budgetCta ? (
            <Button href={budgetCta.url} variant="cta" size="sm">
              {budgetCta.label}
            </Button>
          ) : (
            <Button href="/contacto" variant="cta" size="sm">
              {dict.header.orcamentoDefault}
            </Button>
          )}
        </div>

        <MobileNav
          locale={locale}
          ctaLabel={budgetCta?.label ?? dict.header.orcamentoDefault}
          ctaUrl={budgetCta?.url ?? "/contacto"}
        />
      </div>
    </header>
  );
}
