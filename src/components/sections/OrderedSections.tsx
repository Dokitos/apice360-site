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
 *
 * Não ter linha na base de dados não é o mesmo que estar desativada. Um bloco
 * que a página desenha e para o qual o painel não tem linha nenhuma continua
 * a aparecer, no lugar em que a página o declara: a linha só existe para lhe
 * dar texto e posição, e a falta dela apagava a secção do site sem nada no
 * painel que o explicasse. Desativada é outra coisa — é uma escolha de quem
 * edita, e essa respeita-se.
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
  const declarados = Object.keys(blocks);
  const posicaoDeclarada = new Map(declarados.map((key, i) => [key, i]));
  const chavesComLinha = new Set(sections.map((s) => s.key));

  const visiveis = sections.filter((s) => s.isActive !== false);
  const semLinha = declarados.filter((key) => !chavesComLinha.has(key));

  // Intercala os blocos sem linha entre os que o painel ordenou, pela posição
  // em que a página os declara. Sem isto iriam todos parar ao fim.
  const sequencia: { key: string; section: GenericSectionData | null }[] = [];
  let porColocar = 0;

  for (const section of visiveis) {
    const posicao = posicaoDeclarada.get(section.key) ?? Number.POSITIVE_INFINITY;
    while (
      porColocar < semLinha.length &&
      (posicaoDeclarada.get(semLinha[porColocar]) ?? 0) < posicao
    ) {
      sequencia.push({ key: semLinha[porColocar], section: null });
      porColocar++;
    }
    sequencia.push({ key: section.key, section });
  }
  for (; porColocar < semLinha.length; porColocar++) {
    sequencia.push({ key: semLinha[porColocar], section: null });
  }

  return (
    <>
      {sequencia.map(({ key, section }, i) => {
        const block = blocks[key];
        if (block === undefined && section) {
          return <GenericPageSection key={key} section={section} locale={locale} alt={i % 2 === 1} />;
        }
        return block ? <div key={key}>{block}</div> : null;
      })}
    </>
  );
}
