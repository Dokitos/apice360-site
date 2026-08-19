import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPageSection, getPageSections, getPageSeo, getSiteSettings, getCta } from "@/lib/content";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/dictionary";
import { PageIntroSection } from "@/components/sections/PageIntroSection";
import { ContactForm } from "@/components/sections/ContactForm";
import { GenericPageSection } from "@/components/sections/GenericPageSection";
import { KNOWN_PAGE_SECTION_KEYS } from "@/lib/known-page-sections";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const seo = await getPageSeo("AREA_ARQUITETO", locale);
  if (!seo) return {};
  return { title: seo.title, description: seo.description };
}

export default async function AreaDoArquitetoPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const [intro, allSections, settings] = await Promise.all([
    getPageSection("AREA_ARQUITETO", "intro", locale),
    getPageSections("AREA_ARQUITETO", locale),
    getSiteSettings(locale),
  ]);
  if (settings?.architectAreaEnabled === false) notFound();
  const extraSections = allSections.filter((s) => !KNOWN_PAGE_SECTION_KEYS.AREA_ARQUITETO.includes(s.key));
  const introCta = intro?.ctaKey ? await getCta(intro.ctaKey, locale) : null;

  return (
    <>
      <PageIntroSection
        eyebrow={dict.areaArquiteto.eyebrow}
        heading={intro?.heading ?? dict.areaArquiteto.headingDefault}
        body={intro?.body ?? dict.areaArquiteto.bodyDefault}
        imageUrl={intro?.imageUrl}
        cta={introCta}
      />

      <Reveal as="section" className="bg-surface py-24">
        <div className="mx-auto max-w-xl px-5 md:px-20">
          <h2 className="mb-8 text-center font-heading text-headline-md">{dict.areaArquiteto.ctaHeading}</h2>
          <Card variant="glass" className="p-10">
            <ContactForm type="ARCHITECT_PARTNERSHIP" sourcePage="/area-do-arquiteto" locale={locale} />
          </Card>
        </div>
      </Reveal>

      {extraSections.map((section, i) => (
        <GenericPageSection key={section.key} section={section} locale={locale} alt={i % 2 === 1} />
      ))}
    </>
  );
}
