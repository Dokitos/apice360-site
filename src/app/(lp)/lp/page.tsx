import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  getCta,
  getLpPriceTiers,
  getPageSection,
  getPageSections,
  getPageSeo,
  getSiteSettings,
  getStats,
} from "@/lib/content";
import { getLocale } from "@/lib/locale";
import { OrderedSections } from "@/components/sections/OrderedSections";
import { LpHero } from "@/components/lp/LpHero";
import { LpBenefits } from "@/components/lp/LpBenefits";
import { LpSimulator } from "@/components/lp/LpSimulator";
import { LpTrust } from "@/components/lp/LpTrust";
import { LpContactSection } from "@/components/lp/LpContactSection";
import { Footer } from "@/components/layout/Footer";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const seo = await getPageSeo("LP", locale);
  if (!seo) return {};
  return { title: seo.title, description: seo.description };
}

/** Extrai o número em formato wa.me a partir de um URL de WhatsApp ou de um telefone. */
function whatsappNumberFrom(...candidates: (string | null | undefined)[]): string {
  for (const candidate of candidates) {
    const digits = (candidate ?? "").replace(/\D/g, "");
    if (digits.length >= 9) return digits;
  }
  return "";
}

export default async function LandingPage() {
  const locale = await getLocale();

  const [hero, heroCta, benefits, simulator, trust, trustCta, contact, tiers, settings, stats, allSections] =
    await Promise.all([
      getPageSection("LP", "hero", locale),
      getCta("lp_hero", locale),
      getPageSection("LP", "benefits", locale),
      getPageSection("LP", "simulator", locale),
      getPageSection("LP", "trust", locale),
      getCta("lp_trust_visit", locale),
      getPageSection("LP", "contact", locale),
      getLpPriceTiers(locale),
      getSiteSettings(locale),
      getStats(locale),
      getPageSections("LP", locale),
    ]);

  const whatsappNumber = whatsappNumberFrom(settings?.whatsappCommercial, settings?.whatsappGeneral, settings?.phone);

  // Mesmo padrão da homepage: a ordem sai da base de dados, que é o que o
  // painel arrasta, em vez de estar fixa nesta sequência de JSX.
  const blocos: Record<string, ReactNode> = {
    hero: (
      <LpHero
        locale={locale}
        eyebrow={hero?.eyebrow}
        heading={hero?.heading ?? "A Sua Moradia Pronta Até 3x Mais Rápido, Com a Segurança do Aço Leve."}
        subheading={hero?.subheading}
        imageUrl={hero?.imageUrl ?? "/images/hero-bg.jpg"}
        ctaLabel={hero?.ctaLabel ?? heroCta?.label ?? "Simular a minha estimativa"}
        trustBadges={stats.slice(0, 3)}
      />
    ),
    benefits: benefits ? (
      <LpBenefits
          locale={locale}
          heading={benefits.heading ?? "Porque o LSF é a Melhor Escolha em Portugal?"}
          subheading={benefits.subheading}
        items={benefits.items}
      />
    ) : null,
    simulator: tiers.length > 0 ? (
      <LpSimulator
          locale={locale}
          heading={simulator?.heading ?? "Simule a sua estimativa em 1 minuto"}
          subheading={simulator?.subheading}
          tiers={tiers}
        whatsappNumber={whatsappNumber}
      />
    ) : null,
    trust: trust ? (
      <LpTrust
          heading={trust.heading ?? "Porque Escolher a Ápice 360"}
          items={trust.items}
          ctaBody={trust.body}
          ctaLabel={trust.ctaLabel ?? trustCta?.label}
        ctaHref={trustCta?.url ?? settings?.whatsappCommercial}
      />
    ) : null,
    contact: contact ? (
      <LpContactSection
          locale={locale}
          heading={contact.heading ?? "Construímos o Seu Sonho"}
          body={contact.subheading}
        highlights={contact.items}
      />
    ) : null,
  };

  return (
    <>
      <OrderedSections sections={allSections} blocks={blocos} locale={locale} />

      {/* O mesmo rodapé do site. A LP tinha um próprio, mais curto, pensado
          para não dar saídas ao visitante de campanha — o cliente preferiu a
          coerência de ter um rodapé só. */}
      <Footer />
    </>
  );
}
