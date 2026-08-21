import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCustomPageBySlug, getCustomPageSections } from "@/lib/content";
import { getLocale } from "@/lib/locale";
import { GenericPageSection } from "@/components/sections/GenericPageSection";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const page = await getCustomPageBySlug(slug, locale);
  if (!page) return {};
  return {
    title: page.seoTitle ?? page.heading ?? undefined,
    description: page.seoDescription ?? undefined,
  };
}

export default async function CustomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const locale = await getLocale();
  const page = await getCustomPageBySlug(slug, locale);
  if (!page) notFound();

  const sections = await getCustomPageSections(page.id, locale);

  return (
    <>
      {page.heading ? (
        <Reveal as="section" className="bg-surface py-20">
          <div className="mx-auto max-w-3xl px-5 text-center md:px-20">
            <h1 className="font-heading text-headline-lg">{page.heading}</h1>
          </div>
        </Reveal>
      ) : null}

      {sections.map((section, i) => (
        <GenericPageSection key={section.key} section={section} locale={locale} alt={i % 2 === 1} />
      ))}
    </>
  );
}
