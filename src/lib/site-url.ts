/**
 * Endereço público do site, usado no sitemap, no robots.txt e nos URLs
 * canónicos. Sem ele os motores de busca veem caminhos relativos e não
 * conseguem construir o endereço absoluto de cada página.
 *
 * Em produção vem de NEXT_PUBLIC_SITE_URL; a Vercel também expõe
 * VERCEL_PROJECT_PRODUCTION_URL, que serve de rede de segurança para
 * pré-visualizações. O valor final nunca leva barra no fim, para não gerar
 * endereços com barras a dobrar.
 */
const FALLBACK = "https://www.apice360.com";

function normalizar(url: string): string {
  const comEsquema = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  return comEsquema.replace(/\/+$/, "");
}

export const SITE_URL = normalizar(
  process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    FALLBACK,
);

/** Caminho relativo → endereço absoluto, para canónicos e sitemap. */
export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
