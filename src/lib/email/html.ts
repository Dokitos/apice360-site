import sanitizeHtml from "sanitize-html";

/**
 * Limpeza do corpo de um email antes de o mostrar no painel.
 *
 * O que chega na caixa de entrada é escrito por desconhecidos, por isso é a
 * entrada menos de confiança do sistema inteiro. A lista é mais larga do que
 * a do editor do site (os emails vêm cheios de tabelas e de estilos em linha,
 * e sem elas ficam ilegíveis), mas corta tudo o que executa ou carrega outra
 * coisa: script, iframe, object, embed, form e os atributos "on*". Também
 * não deixa passar <style>, para o CSS de um email não escapar para o painel.
 */
const TAGS_PERMITIDAS = [
  "p", "br", "hr", "div", "span", "strong", "b", "em", "i", "s", "u", "small", "sub", "sup",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "dl", "dt", "dd",
  "blockquote", "pre", "code",
  "a", "img",
  "table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col",
  "center", "font",
];

const ESTILOS_PERMITIDOS = {
  "*": {
    color: [/.*/],
    "background-color": [/.*/],
    "text-align": [/^(left|right|center|justify)$/],
    "font-size": [/^\d+(\.\d+)?(px|pt|em|rem|%)$/],
    "font-weight": [/^(normal|bold|lighter|bolder|\d{3})$/],
    "font-style": [/^(normal|italic)$/],
    "font-family": [/.*/],
    "text-decoration": [/.*/],
    padding: [/.*/],
    "padding-top": [/.*/],
    "padding-bottom": [/.*/],
    "padding-left": [/.*/],
    "padding-right": [/.*/],
    margin: [/.*/],
    "margin-top": [/.*/],
    "margin-bottom": [/.*/],
    "line-height": [/.*/],
    border: [/.*/],
    "border-radius": [/.*/],
    "border-collapse": [/.*/],
    width: [/.*/],
    "max-width": [/.*/],
    height: [/.*/],
    display: [/^(block|inline|inline-block|none|table|table-cell|table-row)$/],
  },
};

export function sanitizeEmailHtml(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: TAGS_PERMITIDAS,
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title", "style"],
      img: ["src", "alt", "title", "width", "height", "style"],
      table: ["width", "cellpadding", "cellspacing", "border", "align", "style"],
      td: ["width", "height", "colspan", "rowspan", "align", "valign", "bgcolor", "style"],
      th: ["width", "height", "colspan", "rowspan", "align", "valign", "bgcolor", "style"],
      tr: ["align", "valign", "bgcolor", "style"],
      col: ["width", "span", "style"],
      font: ["color", "face", "size"],
      "*": ["style", "align", "dir", "lang"],
    },
    allowedStyles: ESTILOS_PERMITIDOS,
    // data: fica de fora de propósito em `a` — um href "data:" é uma forma
    // conhecida de servir HTML com script a partir de um clique.
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https", "data", "cid"] },
    transformTags: {
      // Um link num email abre fora do painel, e sem `noopener` a página de
      // destino fica com uma referência para a janela do painel.
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
    },
  });
}

/**
 * Texto simples a partir do corpo, para a pré-visualização na lista e para o
 * campo de texto alternativo de uma mensagem enviada em HTML.
 */
export function htmlToText(html: string): string {
  const semBlocos = html
    .replace(/<\s*br\s*\/?\s*>/gi, "\n")
    .replace(/<\/\s*(p|div|tr|li|h[1-6])\s*>/gi, "\n");
  const semEtiquetas = sanitizeHtml(semBlocos, { allowedTags: [], allowedAttributes: {} });
  return decodeEntities(semEtiquetas).replace(/\n{3,}/g, "\n\n").trim();
}

/** Primeiras linhas, numa só linha, para a lista de mensagens. */
export function snippetFrom(html: string | null, text: string | null, max = 180): string {
  const base = text?.trim() || (html ? htmlToText(html) : "");
  const numaLinha = base.replace(/\s+/g, " ").trim();
  return numaLinha.length > max ? `${numaLinha.slice(0, max - 1)}…` : numaLinha;
}

/** Corpo de uma mensagem escrita no painel: parágrafos a partir de texto simples. */
export function textToHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((bloco) => `<p>${escapeHtml(bloco).replace(/\n/g, "<br />")}</p>`)
    .join("");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// O sanitize-html deixa as entidades como as encontrou; num resumo de texto
// simples "&amp;" lido por uma pessoa é ruído.
function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
