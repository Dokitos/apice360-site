/**
 * As montagens possíveis de uma secção criada no painel.
 *
 * É a única lista: o seletor do formulário, a validação do servidor e o
 * apresentador genérico leem todos daqui. Acrescentar uma montagem é
 * acrescentar uma entrada aqui e o ramo correspondente em
 * src/components/sections/GenericPageSection.tsx.
 */

export const SECTION_LAYOUT_VALUES = [
  "standard",
  "grid",
  "timeline",
  "stats",
  "split",
  "split_reverse",
  "features",
  "features_reverse",
  "banner",
] as const;

export type SectionLayout = (typeof SECTION_LAYOUT_VALUES)[number];

export type SectionLayoutInfo = {
  value: SectionLayout;
  /** Cabeçalho do grupo no seletor. */
  group: string;
  label: string;
  /** O que esta montagem usa — aparece por baixo do seletor, no painel. */
  hint: string;
};

const TEXTO = "Texto e itens";
const IMAGEM = "Imagem ao lado do texto";
const DESTAQUE = "Faixa de destaque";

export const SECTION_LAYOUTS: SectionLayoutInfo[] = [
  {
    value: "standard",
    group: TEXTO,
    label: "Padrão — texto centrado e itens em cartões",
    hint: "Título e texto ao centro, os itens em cartões de três colunas. A imagem, se houver, fica por baixo do texto.",
  },
  {
    value: "grid",
    group: TEXTO,
    label: "Grelha de cartões",
    hint: "Os itens em cartões de três colunas, com ícone, título e texto. Precisa de título na secção.",
  },
  {
    value: "timeline",
    group: TEXTO,
    label: "Linha do tempo — passos numerados",
    hint: "Os itens em sequência, um por passo. Usa o campo «Número» de cada item (1, 2, 3...). Precisa de título na secção.",
  },
  {
    value: "stats",
    group: TEXTO,
    label: "Números em destaque",
    hint: "Cada item vira um número grande: o campo «Número» é o valor (ex: 25 anos) e o título é a legenda. Precisa de título na secção.",
  },
  {
    value: "split",
    group: IMAGEM,
    label: "Imagem à esquerda, texto e lista à direita",
    hint: "Imagem de um lado; do outro o título, o texto e os itens como lista com ícone. Precisa de título e de imagem.",
  },
  {
    value: "split_reverse",
    group: IMAGEM,
    label: "Imagem à direita, texto e lista à esquerda",
    hint: "O mesmo, com a imagem do lado oposto. Útil para alternar secções seguidas.",
  },
  {
    value: "features",
    group: IMAGEM,
    label: "Imagem à esquerda, destaques à direita",
    hint: "Como o anterior, mas cada item aparece com ícone num quadrado, título a negrito e um parágrafo por baixo.",
  },
  {
    value: "features_reverse",
    group: IMAGEM,
    label: "Imagem à direita, destaques à esquerda",
    hint: "O mesmo, com a imagem do lado oposto.",
  },
  {
    value: "banner",
    group: DESTAQUE,
    label: "Faixa laranja com botão",
    hint: "Faixa de largura total na cor da marca, para uma chamada à ação. Os itens aparecem em linha, pequenos. Precisa de título.",
  },
];

/** Agrupado para o <optgroup> do seletor, pela ordem em que os grupos aparecem acima. */
export function sectionLayoutsByGroup(): { group: string; layouts: SectionLayoutInfo[] }[] {
  const grupos: { group: string; layouts: SectionLayoutInfo[] }[] = [];
  for (const layout of SECTION_LAYOUTS) {
    const atual = grupos.find((g) => g.group === layout.group);
    if (atual) atual.layouts.push(layout);
    else grupos.push({ group: layout.group, layouts: [layout] });
  }
  return grupos;
}

export function sectionLayoutHint(value: string): string {
  return SECTION_LAYOUTS.find((l) => l.value === value)?.hint ?? "";
}
