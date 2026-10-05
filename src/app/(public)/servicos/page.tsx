import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { getPageSection, getPageSections, getCta, getServices, getPageSeo } from "@/lib/content";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/dictionary";
import { PageIntroSection } from "@/components/sections/PageIntroSection";
import { ServiceDetailSection } from "@/components/sections/ServiceDetailSection";
import { TimelineSection } from "@/components/sections/TimelineSection";
import { OrderedSections } from "@/components/sections/OrderedSections";
import { Card } from "@/components/ui/Card";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const seo = await getPageSeo("SERVICOS", locale);
  if (!seo) return {};
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: "/servicos" },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: "/servicos",
      images: seo.ogImageUrl ? [seo.ogImageUrl] : undefined,
    },
  };
}

export default async function ServicosPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const [intro, services, managementModel, finalCta, allSections] = await Promise.all([
    getPageSection("SERVICOS", "intro", locale),
    getServices(locale),
    getPageSection("SERVICOS", "management_model", locale),
    getCta("services_final_cta", locale),
    getPageSections("SERVICOS", locale),
  ]);

  const [ctas, introCta] = await Promise.all([
    Promise.all(services.map((service) => (service.ctaKey ? getCta(service.ctaKey, locale) : Promise.resolve(null)))),
    intro?.ctaKey ? getCta(intro.ctaKey, locale) : Promise.resolve(null),
  ]);

  const blocos: Record<string, ReactNode> = {
    intro: (
      <PageIntroSection
        eyebrow={dict.servicos.eyebrow}
        heading={intro?.heading ?? dict.servicos.headingDefault}
        body={intro?.body}
        imageUrl={intro?.imageUrl}
        items={intro?.items}
        cta={introCta}
      />
    ),
    // Atalhos para cada serviço, quando há mais do que um.
    services_nav: services.length > 1 ? (
        <section className="bg-surface-container-lowest py-16">
          <div className="mx-auto grid max-w-site grid-cols-1 gap-10 px-5 md:px-20 lg:grid-cols-2">
            {services.map((service) => (
              <Link key={service.type} href={`#${service.type.toLowerCase()}`}>
                <Card className="p-8 text-center">
                  <h3 className="font-heading text-headline-md">{service.cardLabel}</h3>
                </Card>
              </Link>
            ))}
          </div>
        </section>
    ) : null,
    // A lista de serviços vem do separador "Serviços" do painel, não das
    // secções — aqui é só o lugar dela na página, que já se pode mudar.
    services_list: (
      <>
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
      </>
    ),
    management_model: managementModel ? (
      <TimelineSection
          eyebrow={dict.servicos.modeloEyebrow}
          heading={managementModel.heading ?? dict.servicos.modeloHeadingDefault}
          body={managementModel.body}
          imageUrl={managementModel.imageUrl}
          items={managementModel.items}
        cta={finalCta}
        locale={locale}
      />
    ) : null,
  };

  return (
    <>
      <OrderedSections sections={allSections} blocks={blocos} locale={locale} />
    </>
  );
}
