import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  getPageSection,
  getPageSections,
  getCta,
  getPartners,
  getTestimonials,
  getStats,
  getBlogPosts,
  getPageSeo,
  getSiteSettings,
} from "@/lib/content";
import { getLocale } from "@/lib/locale";
import { HeroSection } from "@/components/sections/HeroSection";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { WhyChooseSection } from "@/components/sections/WhyChooseSection";
import { ResultsStatsSection } from "@/components/sections/ResultsStatsSection";
import { BlogPreviewSection } from "@/components/sections/BlogPreviewSection";
import { OrderedSections } from "@/components/sections/OrderedSections";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const seo = await getPageSeo("HOME", locale);
  if (!seo) return {};
  return { title: seo.title, description: seo.description };
}

export default async function HomePage() {
  const locale = await getLocale();
  const [
    hero,
    heroCta,
    partnersSection,
    testimonialsSection,
    partners,
    testimonials,
    whyChoose,
    whyChooseCta,
    results,
    stats,
    resultsCta,
    blogPreview,
    blogCta,
    posts,
    allSections,
    settings,
  ] = await Promise.all([
    getPageSection("HOME", "hero", locale),
    getCta("home_hero", locale),
    getPageSection("HOME", "partners", locale),
    getPageSection("HOME", "testimonials", locale),
    getPartners(),
    getTestimonials({ onlyHome: true }, locale),
    getPageSection("HOME", "why_choose", locale),
    getCta("why_choose_services", locale),
    getPageSection("HOME", "results", locale),
    getStats(locale),
    getCta("results_portfolio", locale),
    getPageSection("HOME", "blog_preview", locale),
    getCta("blog_see_more", locale),
    getBlogPosts({ limit: 3 }, locale),
    getPageSections("HOME", locale),
    getSiteSettings(locale),
  ]);
  // Cada bloco conhecido fica indexado pela sua chave; a ordem de desenho vem
  // da base de dados, que é o que o painel arrasta. Antes a sequência estava
  // fixa aqui no código: o admin deixava reordenar e nada mudava na página.
  const blocos: Record<string, ReactNode> = {
    hero: (
      <HeroSection
        eyebrow={hero?.eyebrow}
        heading={hero?.heading ?? "Sua Casa Concluída na Metade do Tempo com a Segurança do Aço Leve."}
        subheading={hero?.subheading}
        imageUrl={hero?.imageUrl}
        cta={heroCta}
        trustBadges={stats.slice(0, 3)}
      />
    ),
    partners: (
      <PartnersSection
        heading={partnersSection?.heading}
        subheading={partnersSection?.subheading}
        partners={partners}
        displayMode={settings?.partnersDisplayMode}
      />
    ),
    testimonials: (
      <TestimonialsSection
        heading={testimonialsSection?.heading}
        testimonials={testimonials}
        locale={locale}
      />
    ),
    why_choose: whyChoose ? (
      <WhyChooseSection
          eyebrow={whyChoose.eyebrow}
          heading={whyChoose.heading ?? "Porquê escolher a Ápice 360?"}
          body={whyChoose.body}
          imageUrl={whyChoose.imageUrl}
          items={whyChoose.items}
        cta={whyChooseCta}
        locale={locale}
      />
    ) : null,
    results: stats.length > 0 ? (
      <ResultsStatsSection
          heading={results?.heading ?? "Resultados que constroem confiança."}
          body={results?.body}
        stats={stats}
        cta={resultsCta}
      />
    ) : null,
    // Com o blog desligado, a secção de artigos recentes desaparece também:
    // seria uma fila de cartões a apontar para páginas que já não abrem.
    blog_preview: settings?.blogEnabled === false ? null : (
      <BlogPreviewSection
        heading={blogPreview?.heading}
        subheading={blogPreview?.subheading}
        posts={posts}
        cta={blogCta}
        locale={locale}
      />
    ),
  };

  return (
    <>
      <OrderedSections sections={allSections} blocks={blocos} locale={locale} />
    </>
  );
}
