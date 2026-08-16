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

  const ctas = await Promise.all(
    services.map((service) => (service.ctaKey ? getCta(service.ctaKey) : Promise.resolve(null))),
  );

  return (
    <>
      <PageIntroSection
        eyebrow="Serviços"
        heading={intro?.heading ?? "Construção em LSF, no modelo Chave na Mão."}
        body={intro?.body}
      />

      {services.length > 1 ? (
        <section className="bg-surface-container-lowest py-16">
          <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-5 md:px-20 lg:grid-cols-2">
            {services.map((service) => (
              <Link key={service.type} href={`#${service.type.toLowerCase()}`}>
                <Card className="p-8 text-center">
                  <h3 className="font-heading text-headline-md">{service.cardLabel}</h3>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {services.map((service, index) => (
        <ServiceDetailSection
          key={service.type}
          id={service.type.toLowerCase()}
          title={service.title}
          intro={service.intro}
          imageUrl={service.imageUrl}
          features={service.features}
          cta={ctas[index]}
          reverse={index % 2 === 1}
          className={index % 2 === 0 ? "bg-surface py-32" : "bg-surface-container-lowest py-32"}
        />
      ))}

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
