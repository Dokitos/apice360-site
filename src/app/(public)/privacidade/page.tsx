import type { Metadata } from "next";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/dictionary";
import { getSiteSettings } from "@/lib/content";
import { PageIntroSection } from "@/components/sections/PageIntroSection";
import { ManageCookiePreferencesButton } from "@/components/layout/ManageCookiePreferencesButton";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return { title: dict.privacy.pageTitle, alternates: { canonical: "/privacidade" } };
}

/**
 * Ícone de cada secção, pela ordem em que aparecem no dicionário. Um ícone a
 * mais ou a menos não parte nada: a lista é percorrida com o índice.
 */
const SECTION_ICONS = [
  "badge",
  "database",
  "gavel",
  "share",
  "schedule",
  "verified_user",
  "cookie",
  "shield_person",
];

export default async function PrivacidadePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const settings = await getSiteSettings(locale);

  const empresa = [settings?.t?.footerLegal, settings?.nif ? `NIF ${settings.nif}` : null]
    .filter(Boolean)
    .join(" · ");

  return (
    <>
      <PageIntroSection eyebrow={dict.privacy.pageEyebrow} heading={dict.privacy.pageTitle} />

      <Reveal as="section" className="bg-surface pb-24">
        {/* max-w-site, como o resto do site: a página vivia numa coluna de
            768px, metade da largura de todas as outras, e dava a sensação de
            pertencer a outro sítio. */}
        <div className="mx-auto max-w-site px-5 md:px-20">
          <div className="mb-12 flex flex-wrap items-center justify-between gap-4 rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-6 py-4">
            <p className="font-mono text-xs uppercase tracking-widest text-primary/80">
              {dict.privacy.rgpdNote}
            </p>
            {empresa ? <p className="text-xs text-on-surface-variant">{empresa}</p> : null}
          </div>

          {/* Duas colunas em ecrã largo: um texto legal corrido numa só coluna
              estreita é exactamente o que ninguém lê. */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {dict.privacy.sections.map((section, i) => (
              <Card key={section.title} variant="plain" className="flex h-full flex-col gap-3 p-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                  <Icon name={SECTION_ICONS[i % SECTION_ICONS.length]} className="text-primary" />
                </div>
                <h2 className="font-heading text-headline-sm">{section.title}</h2>
                <p className="text-sm leading-relaxed text-on-surface-variant">{section.body}</p>
              </Card>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card
              variant="plain"
              className="flex flex-col items-start justify-between gap-5 p-8 sm:flex-row sm:items-center"
            >
              <div>
                <h2 className="mb-1 font-heading text-headline-sm">{dict.privacy.manageHeading}</h2>
                <p className="text-sm text-on-surface-variant">{dict.privacy.manageBody}</p>
              </div>
              <ManageCookiePreferencesButton label={dict.privacy.manageButton} />
            </Card>

            <Card variant="plain" className="p-8">
              <h2 className="mb-2 font-heading text-headline-sm">{dict.privacy.deletionHeading}</h2>
              <p className="mb-4 text-sm text-on-surface-variant">{dict.privacy.deletionBody}</p>
              <a
                href={`mailto:${dict.privacy.deletionEmail}`}
                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
              >
                <Icon name="mail" className="text-lg" />
                {dict.privacy.deletionEmail}
              </a>
            </Card>
          </div>
        </div>
      </Reveal>
    </>
  );
}
