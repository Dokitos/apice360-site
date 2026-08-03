import type { Metadata } from "next";
import {
  getPageSection,
  getCta,
  getPartners,
  getTestimonials,
  getStats,
  getBlogPosts,
  getPageSeo,
} from "@/lib/content";
import { HeroSection } from "@/components/sections/HeroSection";
import { PartnersSection } from "@/components/sections/PartnersSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { WhyChooseSection } from "@/components/sections/WhyChooseSection";
import { ResultsStatsSection } from "@/components/sections/ResultsStatsSection";
import { BlogPreviewSection } from "@/components/sections/BlogPreviewSection";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("HOME");
  if (!seo) return {};
  return { title: seo.title, description: seo.description };
}

export default async function HomePage() {
  const [
    hero,
    heroCta,
    partnersSection,
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
  ] = await Promise.all([
    getPageSection("HOME", "hero"),
    getCta("home_hero"),
    getPageSection("HOME", "partners"),
    getPartners(),
    getTestimonials({ onlyHome: true }),
    getPageSection("HOME", "why_choose"),
    getCta("why_choose_services"),
    getPageSection("HOME", "results"),
    getStats(),
    getCta("results_portfolio"),
    getPageSection("HOME", "blog_preview"),
    getCta("blog_see_more"),
    getBlogPosts({ limit: 3 }),
  ]);

  return (
    <>
      <HeroSection
        eyebrow={hero?.eyebrow}
        heading={hero?.heading ?? "Sua Casa Concluída na Metade do Tempo com a Segurança do Aço Leve."}
        subheading={hero?.subheading}
        imageUrl={hero?.imageUrl}
        cta={heroCta}
      />

      <PartnersSection heading={partnersSection?.heading} subheading={partnersSection?.subheading} partners={partners} />

      <TestimonialsSection testimonials={testimonials} />

      {whyChoose ? (
        <WhyChooseSection
          eyebrow={whyChoose.eyebrow}
          heading={whyChoose.heading ?? "Porquê escolher a Ápice 360?"}
          body={whyChoose.body}
          imageUrl={whyChoose.imageUrl}
          items={whyChoose.items}
          cta={whyChooseCta}
        />
      ) : null}

      {stats.length > 0 ? (
        <ResultsStatsSection
          heading={results?.heading ?? "Resultados que constroem confiança."}
          body={results?.body}
          stats={stats}
          cta={resultsCta}
        />
      ) : null}

      <BlogPreviewSection
        heading={blogPreview?.heading}
        subheading={blogPreview?.subheading}
        posts={posts}
        cta={blogCta}
      />
    </>
  );
}
