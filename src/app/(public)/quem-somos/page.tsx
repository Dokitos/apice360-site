import type { Metadata } from "next";
import { getPageSection, getCta, getPageSeo } from "@/lib/content";
import { PageIntroSection } from "@/components/sections/PageIntroSection";
import { CardGridSection } from "@/components/sections/CardGridSection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("QUEM_SOMOS");
  if (!seo) return {};
  return { title: seo.title, description: seo.description };
}

export default async function QuemSomosPage() {
  const [intro, history, method, values, cta] = await Promise.all([
    getPageSection("QUEM_SOMOS", "intro"),
    getPageSection("QUEM_SOMOS", "history"),
    getPageSection("QUEM_SOMOS", "method"),
    getPageSection("QUEM_SOMOS", "values"),
    getCta("about_talk_to_team"),
  ]);

  return (
    <>
      <PageIntroSection
        eyebrow="Quem Somos"
        heading={intro?.heading ?? "Ápice 360: Nascidos para Solucionar a Insegurança da Construção."}
        body={intro?.body ?? intro?.subheading}
        imageUrl={intro?.imageUrl}
      />

      {history ? (
        <CardGridSection
          eyebrow="A Nossa História"
          heading={history.heading ?? "Fundação e Visão"}
          body={history.body}
          items={history.items}
          columns={3}
        />
      ) : null}

      {method ? (
        <TimelineSection
          eyebrow="O Nosso Método"
          heading={method.heading ?? "Gestão 360° de Alto Desempenho"}
          items={method.items}
        />
      ) : null}

      {values ? (
        <CardGridSection eyebrow="Valores" heading={values.heading ?? "O que nos move"} items={values.items} columns={4} />
      ) : null}

      {cta ? (
        <Reveal as="section" className="bg-primary py-24 text-center text-on-primary">
          <div className="mx-auto max-w-[1280px] px-5 md:px-20">
            <h2 className="mb-10 font-heading text-headline-lg">Está a Procurar Velocidade e Garantia?</h2>
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
