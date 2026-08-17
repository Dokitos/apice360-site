import type { Metadata } from "next";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/dictionary";
import { PageIntroSection } from "@/components/sections/PageIntroSection";
import { ManageCookiePreferencesButton } from "@/components/layout/ManageCookiePreferencesButton";
import { Reveal } from "@/components/ui/Reveal";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return { title: dict.privacy.pageTitle };
}

export default async function PrivacidadePage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <>
      <PageIntroSection eyebrow={dict.privacy.pageEyebrow} heading={dict.privacy.pageTitle} />

      <Reveal as="section" className="bg-surface py-24">
        <div className="mx-auto max-w-3xl px-5 md:px-20">
          <p className="mb-10 font-mono text-xs uppercase tracking-widest text-primary/70">{dict.privacy.rgpdNote}</p>

          <div className="space-y-6 text-sm leading-relaxed text-on-surface-variant">
            {dict.privacy.sections.map((section) => (
              <p key={section.title}>
                <strong className="text-on-surface">{section.title}</strong> {section.body}
              </p>
            ))}
          </div>

          <Card variant="plain" className="mt-12 flex flex-col items-start gap-4 p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="mb-1 font-heading text-headline-md">{dict.privacy.manageHeading}</h2>
              <p className="text-sm text-on-surface-variant">{dict.privacy.manageBody}</p>
            </div>
            <ManageCookiePreferencesButton label={dict.privacy.manageButton} />
          </Card>

          <Card variant="plain" className="mt-6 p-8">
            <h2 className="mb-2 font-heading text-headline-md">{dict.privacy.deletionHeading}</h2>
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
      </Reveal>
    </>
  );
}
