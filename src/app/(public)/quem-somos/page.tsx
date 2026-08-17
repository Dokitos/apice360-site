import type { Metadata } from "next";
import { getPageSection, getCta, getPageSeo } from "@/lib/content";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/dictionary";
import { PageIntroSection } from "@/components/sections/PageIntroSection";
import { CardGridSection } from "@/components/sections/CardGridSection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const seo = await getPageSeo("QUEM_SOMOS", locale);
  if (!seo) return {};
  return { title: seo.title, description: seo.description };
}

export default async function QuemSomosPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const [intro, history, method, values, cta] = await Promise.all([
    getPageSection("QUEM_SOMOS", "intro", locale),
    getPageSection("QUEM_SOMOS", "history", locale),
    getPageSection("QUEM_SOMOS", "method", locale),
    getPageSection("QUEM_SOMOS", "values", locale),
    getCta("about_talk_to_team", locale),
  ]);

  return (
    <>
      <PageIntroSection
        eyebrow={dict.quemSomos.eyebrow}
        heading={intro?.heading ?? dict.quemSomos.headingDefault}
        body={intro?.body ?? intro?.subheading}
        imageUrl={intro?.imageUrl}
      />

      {history ? (
        <CardGridSection
          eyebrow={dict.quemSomos.historiaEyebrow}
          heading={history.heading ?? dict.quemSomos.historiaHeadingDefault}
          body={history.body}
          items={history.items}
          columns={3}
        />
      ) : null}

      {method ? (
        <TimelineSection
          eyebrow={dict.quemSomos.metodoEyebrow}
          heading={method.heading ?? dict.quemSomos.metodoHeadingDefault}
          items={method.items}
        />
      ) : null}

      {values ? (
        <CardGridSection
          eyebrow={dict.quemSomos.valoresEyebrow}
          heading={values.heading ?? dict.quemSomos.valoresHeadingDefault}
          items={values.items}
          columns={4}
        />
      ) : null}

      {cta ? (
        <Reveal as="section" className="bg-primary py-24 text-center text-on-primary">
          <div className="mx-auto max-w-[1280px] px-5 md:px-20">
            <h2 className="mb-10 font-heading text-headline-lg">{dict.quemSomos.ctaHeading}</h2>
            <Button
              href={cta.url}
              variant="ghost"
              className="border-on-primary text-on-primary hover:bg-on-primary hover:text-primary"
            >
              {cta.label}
            </Button>
          </div>
        </Reveal>
      ) : null}
    </>
  );
}
