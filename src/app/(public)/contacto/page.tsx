import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getPageSection, getPageSections, getCta, getSiteSettings, getPageSeo } from "@/lib/content";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/dictionary";
import { PageIntroSection } from "@/components/sections/PageIntroSection";
import { ContactForm } from "@/components/sections/ContactForm";
import { ContactMap } from "@/components/sections/ContactMap";
import { ContactChannels } from "@/components/sections/ContactChannels";
import { OrderedSections } from "@/components/sections/OrderedSections";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const seo = await getPageSeo("CONTACTO", locale);
  if (!seo) return {};
  return { title: seo.title, description: seo.description };
}

export default async function ContactoPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const [intro, triagem, settings, whatsappCta, allSections] = await Promise.all([
    getPageSection("CONTACTO", "intro", locale),
    getPageSection("CONTACTO", "triagem", locale),
    getSiteSettings(locale),
    getCta("contact_whatsapp_commercial", locale),
    getPageSections("CONTACTO", locale),
  ]);

  const triagemItems = triagem?.items ?? [];
  const [triagemItemCtas, introCta] = await Promise.all([
    Promise.all(triagemItems.map((item) => (item.ctaKey ? getCta(item.ctaKey, locale) : Promise.resolve(null)))),
    intro?.ctaKey ? getCta(intro.ctaKey, locale) : Promise.resolve(null),
  ]);

  const highlights = [
    { icon: "shield", label: dict.contacto.seguranca },
    { icon: "bolt", label: dict.contacto.velocidade },
    { icon: "verified", label: dict.contacto.qualidade },
  ];

  const blocos: Record<string, ReactNode> = {
    intro: (
      <PageIntroSection
        eyebrow={intro?.eyebrow ?? dict.contacto.eyebrow}
        heading={intro?.heading ?? dict.contacto.heading}
        body={intro?.body ?? dict.contacto.body}
        imageUrl={intro?.imageUrl}
        items={intro?.items}
        cta={introCta}
      />
    ),
    channels: <ContactChannels settings={settings} locale={locale} />,
    triagem: (
      <Reveal as="section" className="bg-surface py-24">
        <div className="mx-auto max-w-site px-5 text-center md:px-20">
          <h2 className="mb-4 font-heading text-headline-md">
            {triagem?.heading ?? dict.contacto.triagemHeadingDefault}
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-on-surface-variant">
            {triagem?.subheading ?? dict.contacto.triagemBodyDefault}
          </p>
          {whatsappCta ? (
            <Button href={whatsappCta.url} variant="cta" size="lg" icon={whatsappCta.iconName ?? undefined}>
              {whatsappCta.label}
            </Button>
          ) : null}
          {triagemItemCtas.some(Boolean) ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
              {triagemItems.map((item, i) => {
                const itemCta = triagemItemCtas[i];
                if (!itemCta) return null;
                return (
                  <Button key={item.id} href={itemCta.url} variant="ghost" icon={itemCta.iconName ?? undefined}>
                    {itemCta.label}
                  </Button>
                );
              })}
            </div>
          ) : null}
        </div>
      </Reveal>
    ),
    // Formulário, mapa e showroom: conteúdo próprio da página, mas o lugar
    // dele na sequência já se pode mudar como o resto.
    form: (
      <Reveal as="section" className="bg-surface-container-lowest py-24">
        <div className="mx-auto grid max-w-site grid-cols-1 gap-16 px-5 md:px-20 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 font-heading text-headline-md">{dict.contacto.emailHeading}</h2>
            <p className="mb-10 text-on-surface-variant">{dict.contacto.emailBody}</p>
            <Card variant="glass" className="p-10">
              <ContactForm type="CONTACT" sourcePage="/contacto" locale={locale} />
            </Card>
          </div>

          <div>
            <ContactMap
              className="mb-8 h-64 w-full overflow-hidden rounded-lg border border-outline-variant/20"
              latitude={settings?.mapLatitude}
              longitude={settings?.mapLongitude}
              label={[settings?.addressLine, settings?.addressCity].filter(Boolean).join(", ") || null}
            />
            <h3 className="mb-2 font-heading text-headline-md">{dict.contacto.showroomHeading}</h3>
            <p className="mb-8 text-on-surface-variant">
              {settings?.t?.showroomText ?? dict.contacto.showroomBodyDefault}
            </p>
            {settings?.phone || settings?.addressLine ? (
              <p className="mb-8 text-sm text-on-surface-variant">
                {settings?.phone}
                {settings?.phone && settings?.addressLine ? " · " : ""}
                {settings?.addressLine}
                {settings?.addressCity ? `, ${settings.addressCity}` : ""}
              </p>
            ) : null}
            <div className="flex gap-6">
              {highlights.map((h) => (
                <div key={h.label} className="flex flex-col items-center gap-2 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Icon name={h.icon} className="text-primary" />
                  </div>
                  <span className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
                    {h.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>
    ),
  };

  return (
    <>
      <OrderedSections sections={allSections} blocks={blocos} locale={locale} />
    </>
  );
}
