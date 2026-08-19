import type { Metadata } from "next";
import { getPageSection, getPageSections, getCta, getSiteSettings, getPageSeo } from "@/lib/content";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/dictionary";
import { PageIntroSection } from "@/components/sections/PageIntroSection";
import { ContactForm } from "@/components/sections/ContactForm";
import { ContactMap } from "@/components/sections/ContactMap";
import { GenericPageSection } from "@/components/sections/GenericPageSection";
import { KNOWN_PAGE_SECTION_KEYS } from "@/lib/known-page-sections";
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
  const [triagem, settings, whatsappCta, allSections] = await Promise.all([
    getPageSection("CONTACTO", "triagem", locale),
    getSiteSettings(locale),
    getCta("contact_whatsapp_commercial", locale),
    getPageSections("CONTACTO", locale),
  ]);
  const extraSections = allSections.filter((s) => !KNOWN_PAGE_SECTION_KEYS.CONTACTO.includes(s.key));

  const highlights = [
    { icon: "shield", label: dict.contacto.seguranca },
    { icon: "bolt", label: dict.contacto.velocidade },
    { icon: "verified", label: dict.contacto.qualidade },
  ];

  return (
    <>
      <PageIntroSection eyebrow={dict.contacto.eyebrow} heading={dict.contacto.heading} body={dict.contacto.body} />

      <Reveal as="section" className="bg-surface py-24">
        <div className="mx-auto max-w-[1280px] px-5 text-center md:px-20">
          <h2 className="mb-4 font-heading text-headline-md">
            {triagem?.heading ?? dict.contacto.triagemHeadingDefault}
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-on-surface-variant">
            {triagem?.subheading ?? dict.contacto.triagemBodyDefault}
          </p>
          {whatsappCta ? (
            <Button href={whatsappCta.url} variant="cta" size="lg" icon={whatsappCta.iconName ?? "chat"}>
              {whatsappCta.label}
            </Button>
          ) : null}
        </div>
      </Reveal>

      <Reveal as="section" className="bg-surface-container-lowest py-24">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-16 px-5 md:px-20 lg:grid-cols-2">
          <div>
            <h2 className="mb-4 font-heading text-headline-md">{dict.contacto.emailHeading}</h2>
            <p className="mb-10 text-on-surface-variant">{dict.contacto.emailBody}</p>
            <Card variant="glass" className="p-10">
              <ContactForm type="CONTACT" sourcePage="/contacto" locale={locale} />
            </Card>
          </div>

          <div>
            <ContactMap className="mb-8 h-64 w-full overflow-hidden rounded-lg border border-outline-variant/20" />
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

      {extraSections.map((section, i) => (
        <GenericPageSection key={section.key} section={section} locale={locale} alt={i % 2 === 0} />
      ))}
    </>
  );
}
