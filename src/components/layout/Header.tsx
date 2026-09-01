import Link from "next/link";
import { getCta, getSiteSettings, getCustomPages } from "@/lib/content";
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
  const [budgetCta, settings, customPages] = await Promise.all([
    getCta("header_budget", locale),
    getSiteSettings(locale),
    getCustomPages(locale),
  ]);
  const showArchitectArea = settings?.architectAreaEnabled ?? true;
  const menuCustomPages = customPages.filter((p) => p.showInMenu);
  const navLinks = getNavLinks(dict, { showArchitectArea, customPages: menuCustomPages });

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-site items-center justify-between gap-4 px-5 md:px-6 2xl:gap-6 2xl:px-10">
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        {/* Os links a 18px só cabem ao lado do logo/CTA a partir de ~1360px;
           abaixo disso vivem na gaveta do MobileNav. Se o cliente acrescentar
           páginas personalizadas até deixarem de caber, a nav encolhe e
           desliza na horizontal em vez de empurrar o CTA para fora do ecrã.
           Os links são centrados com margens automáticas em vez de
           justify-center: com justify-center, um contentor com scroll corta
           o primeiro link em vez de o deixar alcançável. */}
        <nav className="hidden min-w-0 flex-1 items-center gap-4 overflow-x-auto [scrollbar-width:none] min-[1360px]:flex 2xl:gap-6 [&>*:first-child]:ml-auto [&>*:last-child]:mr-auto [&::-webkit-scrollbar]:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-[18px] font-medium text-on-surface-variant transition-colors hover:text-primary"
            >
              <RandomLetterSwap key={link.label} label={link.label} />
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-3 min-[1360px]:flex 2xl:gap-4">
          <LanguageSwitcher locale={locale} variant="compact" />
          {budgetCta ? (
            <Button href={budgetCta.url} variant="cta" size="sm" icon={budgetCta.iconName ?? undefined}>
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
          showArchitectArea={showArchitectArea}
          customPages={menuCustomPages}
        />
      </div>
    </header>
  );
}
