import type { Metadata } from "next";
import { getPageSeo, getFeaturedProjects, getProjectsByCategory, getCta } from "@/lib/content";
import { PageIntroSection } from "@/components/sections/PageIntroSection";
import { PortfolioGrid } from "@/components/sections/PortfolioGrid";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("PORTFOLIO");
  if (!seo) return {};
  return { title: seo.title, description: seo.description };
}

export default async function PortfolioPage() {
  const [featured, lsfProjects, remodelacaoProjects, cta] = await Promise.all([
    getFeaturedProjects(),
    getProjectsByCategory("LSF"),
    getProjectsByCategory("REMODELACAO"),
    getCta("portfolio_final_budget"),
  ]);

  return (
    <>
      <PageIntroSection
        eyebrow="Portfólio"
        heading="O Nosso Portfólio: A Excelência da Ápice 360 em Imagens."
        body="Cada projeto é uma promessa cumprida. Veja em detalhe como a nossa equipa transforma projetos de elevado valor em obras prontas a viver ou a rentabilizar, com segurança e sem surpresas."
      />

      <PortfolioGrid heading="Projetos de Alto Desempenho" projects={featured} variant="featured" />
      <PortfolioGrid heading="LSF - Light Steel Frame" projects={lsfProjects} variant="numbered" />
      <PortfolioGrid heading="Remodelação Total" projects={remodelacaoProjects} variant="numbered" />

      {cta ? (
        <Reveal as="section" className="bg-surface-container-lowest py-24 text-center">
          <Button href={cta.url} variant="cta">
            {cta.label}
          </Button>
        </Reveal>
      ) : null}
    </>
  );
}
