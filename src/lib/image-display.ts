/**
 * Enquadramento de uma imagem, guardado no próprio endereço.
 *
 * Os espaços onde as imagens entram têm altura fixa (uma secção com imagem ao
 * lado do texto reserva 420px), e o normal é a imagem preencher esse espaço e
 * cortar o que sobra. Quando a imagem não tem a forma do espaço — uma
 * ilustração quadrada, por exemplo — o corte come-lhe o topo e a base, e não
 * havia nada no painel para dizer "mostra-a inteira" ou "corta por baixo, não
 * pelo meio".
 *
 * A escolha viaja no fim do endereço, a seguir ao cardinal:
 *
 *   https://…/casa.png#fit=contain
 *   https://…/casa.png#fit=cover&pos=top
 *
 * Vai ali, e não numa coluna nova, porque o endereço de uma imagem está
 * guardado em doze sítios diferentes (secções, itens, serviços, projetos,
 * artigos, parceiros, definições do site) e todos partilham o mesmo campo do
 * painel: desta maneira o controlo aparece em todos de uma vez, sem migrar
 * tabela nenhuma. O cardinal não vai para o servidor quando o browser pede a
 * imagem, por isso um endereço com enquadramento carrega igual a um sem ele —
 * incluindo em quem lê o campo sem saber disto.
 */

export const IMAGE_FITS = ["cover", "contain"] as const;
export type ImageFit = (typeof IMAGE_FITS)[number];

export const IMAGE_POSITIONS = [
  "top-left",
  "top",
  "top-right",
  "left",
  "center",
  "right",
  "bottom-left",
  "bottom",
  "bottom-right",
] as const;
export type ImagePosition = (typeof IMAGE_POSITIONS)[number];

/** Para o CSS `object-position`. */
const CSS_POSITION: Record<ImagePosition, string> = {
  "top-left": "left top",
  top: "center top",
  "top-right": "right top",
  left: "left center",
  center: "center center",
  right: "right center",
  "bottom-left": "left bottom",
  bottom: "center bottom",
  "bottom-right": "right bottom",
};

export type ImageDisplay = {
  /** O endereço limpo, para o `src`. */
  src: string;
  fit: ImageFit;
  position: ImagePosition;
};

export const DEFAULT_IMAGE_DISPLAY = { fit: "cover" as ImageFit, position: "center" as ImagePosition };

export function parseImageDisplay(value: string | null | undefined): ImageDisplay {
  const bruto = value ?? "";
  const cardinal = bruto.indexOf("#");
  if (cardinal === -1) return { src: bruto, ...DEFAULT_IMAGE_DISPLAY };

  const src = bruto.slice(0, cardinal);
  const params = new URLSearchParams(bruto.slice(cardinal + 1));
  const fit = params.get("fit");
  const position = params.get("pos");

  return {
    src,
    fit: IMAGE_FITS.includes(fit as ImageFit) ? (fit as ImageFit) : DEFAULT_IMAGE_DISPLAY.fit,
    position: IMAGE_POSITIONS.includes(position as ImagePosition)
      ? (position as ImagePosition)
      : DEFAULT_IMAGE_DISPLAY.position,
  };
}

/** O contrário: junta a escolha ao endereço, omitindo o que for a predefinição. */
export function buildImageValue(src: string, fit: ImageFit, position: ImagePosition): string {
  const limpo = src.split("#")[0];
  if (!limpo) return "";

  const partes: string[] = [];
  if (fit !== DEFAULT_IMAGE_DISPLAY.fit) partes.push(`fit=${fit}`);
  // Com a imagem inteira à vista não há nada cortado para escolher, por isso
  // a posição não vai no endereço — evita guardar uma escolha sem efeito.
  if (fit === "cover" && position !== DEFAULT_IMAGE_DISPLAY.position) partes.push(`pos=${position}`);

  return partes.length > 0 ? `${limpo}#${partes.join("&")}` : limpo;
}

/** Estilo pronto a pôr num `<img>`. */
export function imageDisplayStyle(display: Pick<ImageDisplay, "fit" | "position">) {
  return {
    objectFit: display.fit,
    objectPosition: display.fit === "cover" ? CSS_POSITION[display.position] : "center",
  } as const;
}
