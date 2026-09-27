import type { ReactNode } from "react";
import { GenericPageSection, type GenericSectionData } from "@/components/sections/GenericPageSection";
import type { SiteLocale } from "@/lib/locale";

/**
 * Desenha as secções de uma página pela ordem que vem da base de dados — que
 * é a ordem que o painel arrasta em Secções de Página.
 *
 * Cada página entrega um mapa de chave → bloco já montado. As chaves que não
 * estiverem no mapa são secções criadas no painel sem componente próprio e
 * passam pelo apresentador genérico. Uma chave com valor `null` é um bloco
 * que existe mas não tem o que mostrar (por exemplo, estatísticas sem
 * registos) e simplesmente não aparece.
 *
 * Antes disto cada página tinha a sequência escrita à mão no JSX: o painel
 * deixava reordenar, gravava a ordem, e a página ignorava-a.
 */
export function OrderedSections({
  sections,
  blocks,
  locale,
}: {
  sections: GenericSectionData[];
  blocks: Record<string, ReactNode>;
  locale: SiteLocale;
}) {
  return (
    <>
      {sections.map((section, i) => {
        const block = blocks[section.key];
        if (block === undefined) {
          return <GenericPageSection key={section.key} section={section} locale={locale} alt={i % 2 === 1} />;
        }
        return block ? <div key={section.key}>{block}</div> : null;
      })}
    </>
  );
}
