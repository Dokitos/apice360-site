import type { Metadata } from "next";
import { getPageSeo, getPageSections, getFeaturedProjects, getProjectsByCategory, getCta } from "@/lib/content";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/dictionary";
import { PageIntroSection } from "@/components/sections/PageIntroSection";
import { PortfolioGrid } from "@/components/sections/PortfolioGrid";
import { GenericPageSection } from "@/components/sections/GenericPageSection";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const seo = await getPageSeo("PORTFOLIO", locale);
  if (!seo) return {};
  return { title: seo.title, description: seo.description };
}

export default async function PortfolioPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const [featured, lsfProjects, cta, extraSections] = await Promise.all([
    getFeaturedProjects(locale),
    getProjectsByCategory("LSF", locale),
    getCta("portfolio_final_budget", locale),
    getPageSections("PORTFOLIO", locale),
  ]);

  return (
    <>
      <PageIntroSection eyebrow={dict.portfolio.eyebrow} heading={dict.portfolio.heading} body={dict.portfolio.body} />

      <PortfolioGrid heading={dict.portfolio.projetosDestaque} projects={featured} variant="featured" />
      <PortfolioGrid heading={dict.portfolio.lsfHeading} projects={lsfProjects} variant="numbered" />

      {cta ? (
        <Reveal as="section" className="bg-surface-container-lowest py-24 text-center">
          <Button href={cta.url} variant="cta" icon={cta.iconName ?? undefined}>
            {cta.label}
          </Button>
        </Reveal>
      ) : null}

      {extraSections.map((section, i) => (
        <GenericPageSection key={section.key} section={section} locale={locale} alt={i % 2 === 1} />
      ))}
    </>
  );
}
