import type { Metadata } from "next";
import Link from "next/link";
import { getPageSection, getCta, getServices, getPageSeo } from "@/lib/content";
import { PageIntroSection } from "@/components/sections/PageIntroSection";
import { ServiceDetailSection } from "@/components/sections/ServiceDetailSection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import { Card } from "@/components/ui/Card";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("SERVICOS");
  if (!seo) return {};
  return { title: seo.title, description: seo.description };
}

export default async function ServicosPage() {
  const [intro, services, managementModel, finalCta] = await Promise.all([
    getPageSection("SERVICOS", "intro"),
    getServices(),
    getPageSection("SERVICOS", "management_model"),
    getCta("services_final_cta"),
  ]);

  const lsf = services.find((s) => s.type === "LSF");
  const remodelacao = services.find((s) => s.type === "REMODELACAO");

  const [lsfCta, remodelacaoCta] = await Promise.all([
    lsf?.ctaKey ? getCta(lsf.ctaKey) : Promise.resolve(null),
    remodelacao?.ctaKey ? getCta(remodelacao.ctaKey) : Promise.resolve(null),
  ]);

  return (
    <>
      <PageIntroSection
        eyebrow="Serviços"
        heading={intro?.heading ?? "Construção em LSF e Remodelação Total, ambos no modelo Chave na Mão."}
        body={intro?.body}
      />

      <section className="bg-surface-container-lowest py-16">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-5 md:px-20 lg:grid-cols-2">
          {lsf ? (
            <Link href="#lsf">
              <Card className="p-8 text-center">
                <h3 className="font-heading text-headline-md">{lsf.cardLabel}</h3>
              </Card>
            </Link>
          ) : null}
          {remodelacao ? (
            <Link href="#remodelacao">
              <Card className="p-8 text-center">
                <h3 className="font-heading text-headline-md">{remodelacao.cardLabel}</h3>
              </Card>
            </Link>
          ) : null}
        </div>
      </section>

      {lsf ? (
        <ServiceDetailSection
          id="lsf"
          title={lsf.title}
          intro={lsf.intro}
          imageUrl={lsf.imageUrl}
          features={lsf.features}
          cta={lsfCta}
          className="bg-surface py-32"
        />
      ) : null}

      {remodelacao ? (
        <ServiceDetailSection
          id="remodelacao"
          title={remodelacao.title}
          intro={remodelacao.intro}
          imageUrl={remodelacao.imageUrl}
          features={remodelacao.features}
          cta={remodelacaoCta}
          reverse
          className="bg-surface-container-lowest py-32"
        />
      ) : null}

      {managementModel ? (
        <TimelineSection
          eyebrow="O Nosso Modelo"
          heading={managementModel.heading ?? "Gestão Chave na Mão"}
          items={managementModel.items}
          cta={finalCta}
        />
      ) : null}
    </>
  );
}
