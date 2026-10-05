import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl, SITE_URL } from "@/lib/site-url";

/**
 * robots.txt gerado, para acompanhar o estado do site.
 *
 * Regra geral: tudo aberto a motores de busca e a rastreadores de IA — é o
 * que o cliente quer, e são esses rastreadores que alimentam as respostas do
 * ChatGPT, do Perplexity e afins. Fecham-se apenas o painel e a API, que não
 * têm nada de público e cujo conteúdo exige sessão.
 *
 * Em modo de manutenção fecha-se tudo: um site que responde "voltamos em
 * breve" não deve ser indexado com esse texto, e desfazer isso depois demora
 * semanas.
 */
export const dynamic = "force-dynamic";

const PRIVADO = ["/admin", "/admin/", "/api/"];

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: { maintenanceMode: true },
  });

  if (settings?.maintenanceMode) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVADO },
      // Nomeados um a um de propósito: alguns destes rastreadores ignoram a
      // regra genérica, e deixá-los implícitos seria contar com a sorte.
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-User",
          "Claude-SearchBot",
          "PerplexityBot",
          "Perplexity-User",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
          "Bingbot",
          "Amazonbot",
          "meta-externalagent",
        ],
        allow: "/",
        disallow: PRIVADO,
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
