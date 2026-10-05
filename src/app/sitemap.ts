import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site-url";

/**
 * Sitemap gerado a partir da base de dados, não escrito à mão.
 *
 * Um sitemap estático envelhece no dia em que alguém publica um artigo ou um
 * projeto. Este lê o que está publicado no momento do pedido e respeita os
 * interruptores das Definições do Site: uma página desligada responde 404, e
 * anunciá-la aqui só serviria para o Google bater numa porta fechada.
 */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  // Em manutenção o site não está aberto a ninguém; não vale a pena convidar
  // os motores de busca a indexar uma página de "voltamos em breve".
  if (settings?.maintenanceMode) return [];

  const [projetos, artigos, paginas] = await Promise.all([
    prisma.portfolioProject.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    }),
    // O slug do artigo vive na tradução, não no artigo: listamos o
    // português, que é o idioma de origem e o que o site serve por omissão.
    settings?.blogEnabled === false
      ? []
      : prisma.blogPost.findMany({
          where: { status: "PUBLISHED" },
          select: {
            updatedAt: true,
            publishedAt: true,
            translations: { where: { locale: "PT" }, select: { slug: true } },
          },
        }),
    prisma.customPage.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
    }),
  ]);

  const agora = new Date();

  const fixas: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: agora, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/quem-somos"), lastModified: agora, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/servicos"), lastModified: agora, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/portfolio"), lastModified: agora, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/contacto"), lastModified: agora, changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/privacidade"), lastModified: agora, changeFrequency: "yearly", priority: 0.2 },
  ];

  if (settings?.lsfPageEnabled !== false) {
    fixas.push({ url: absoluteUrl("/lsf"), lastModified: agora, changeFrequency: "monthly", priority: 0.9 });
  }
  if (settings?.architectAreaEnabled !== false) {
    fixas.push({
      url: absoluteUrl("/area-do-arquiteto"),
      lastModified: agora,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }
  if (settings?.blogEnabled !== false) {
    fixas.push({ url: absoluteUrl("/blog"), lastModified: agora, changeFrequency: "weekly", priority: 0.7 });
  }

  return [
    ...fixas,
    ...projetos.map((p) => ({
      url: absoluteUrl(`/portfolio/${p.slug}`),
      lastModified: p.updatedAt ?? agora,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...artigos
      .map((a) => ({ slug: a.translations[0]?.slug, data: a.updatedAt ?? a.publishedAt ?? agora }))
      .filter((a): a is { slug: string; data: Date } => Boolean(a.slug))
      .map((a) => ({
        url: absoluteUrl(`/blog/${a.slug}`),
        lastModified: a.data,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
    ...paginas.map((p) => ({
      url: absoluteUrl(`/paginas/${p.slug}`),
      lastModified: p.updatedAt ?? agora,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
