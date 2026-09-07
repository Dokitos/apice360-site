import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCta, getPageSections, getPageSeo, getSiteSettings } from "@/lib/content";
import { getLocale } from "@/lib/locale";
import { KNOWN_PAGE_SECTION_KEYS } from "@/lib/known-page-sections";
import { LsfDeck, type DeckChapter } from "@/components/lsf/LsfDeck";
import {
  LsfAnatomyChapter,
  LsfCardsChapter,
  LsfCtaChapter,
  LsfFitChapter,
  LsfHeroChapter,
  LsfMistakesChapter,
  LsfProcessChapter,
  LsfStatementChapter,
  type LsfSection,
} from "@/components/lsf/LsfChapters";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const seo = await getPageSeo("LSF", locale);
  if (!seo) return {};
  return { title: seo.title, description: seo.description };
}

/** Ordem em que os capítulos conhecidos aparecem, independente do `order` da BD. */
const CHAPTER_ORDER = KNOWN_PAGE_SECTION_KEYS.LSF;

export default async function LsfPage() {
  const locale = await getLocale();
  const [sections, settings, cta] = await Promise.all([
    getPageSections("LSF", locale),
    getSiteSettings(locale),
    getCta("lsf_talk_to_us", locale),
  ]);

  // Mesmo comportamento da Área do Arquiteto: desligada nas Definições do
  // Site, a rota deixa de existir (e o link já saiu do menu via getNavLinks).
  if (settings?.lsfPageEnabled === false) notFound();
  if (sections.length === 0) notFound();

  const byKey = new Map(sections.map((section) => [section.key, section as LsfSection]));
  const known = CHAPTER_ORDER.map((key) => byKey.get(key)).filter((s): s is LsfSection => Boolean(s));
  const extras = sections.filter((s) => !CHAPTER_ORDER.includes(s.key)) as LsfSection[];
  const ordered = [...known, ...extras];

  const chapters: DeckChapter[] = ordered.map((section) => ({
    id: `lsf-${section.key}`,
    // A sobrancelha é curta por natureza — dá uma boa etiqueta para a
    // coluna de navegação; sem ela, cai para o título.
    title: section.eyebrow ?? section.heading ?? section.key,
  }));
  const total = ordered.length;
  const positionOf = (section: LsfSection) => ({
    locale,
    index: ordered.indexOf(section) + 1,
    total,
  });

  return (
    <LsfDeck chapters={chapters} locale={locale}>
      {ordered.map((section) => {
        const position = positionOf(section);

        switch (section.key) {
          case "hero":
            return <LsfHeroChapter key={section.key} section={section} locale={locale} total={total} />;
          case "what_is":
            return <LsfStatementChapter key={section.key} section={section} position={position} tone="light" />;
          case "why_portugal":
            return (
              <LsfStatementChapter key={section.key} section={section} position={position} tone="muted" reverse />
            );
          case "benefits":
            return <LsfCardsChapter key={section.key} section={section} position={position} tone="light" />;
          case "anatomy":
            return <LsfAnatomyChapter key={section.key} section={section} position={position} />;
          case "facts":
            return (
              <LsfCardsChapter key={section.key} section={section} position={position} tone="ink" showNumbers />
            );
          case "process":
            return <LsfProcessChapter key={section.key} section={section} position={position} />;
          case "fit":
            return <LsfFitChapter key={section.key} section={section} position={position} />;
          case "mistakes":
            return <LsfMistakesChapter key={section.key} section={section} position={position} />;
          case "cta":
            return <LsfCtaChapter key={section.key} section={section} position={position} cta={cta} />;
          default:
            // Secções criadas no admin entram na sequência com o formato de
            // leitura, para não quebrarem o ritmo da página.
            return <LsfStatementChapter key={section.key} section={section} position={position} tone="muted" />;
        }
      })}
    </LsfDeck>
  );
}
