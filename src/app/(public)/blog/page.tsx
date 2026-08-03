import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts, countBlogPosts, getPageSeo } from "@/lib/content";
import { PageIntroSection } from "@/components/sections/PageIntroSection";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getPageSeo("BLOG");
  if (!seo) return {};
  return { title: seo.title, description: seo.description };
}

const PAGE_SIZE = 6;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);

  const [posts, total] = await Promise.all([
    getBlogPosts({ limit: PAGE_SIZE, skip: (currentPage - 1) * PAGE_SIZE }),
    countBlogPosts(),
  ]);

  const hasNextPage = currentPage * PAGE_SIZE < total;

  return (
    <>
      <PageIntroSection
        eyebrow="Blog da Construção"
        heading="Blog Ápice 360: Conhecimento de Construção em Alto Desempenho."
        body="O seu recurso especializado sobre LSF, Remodelações de Alto Valor e gestão de projetos. Educamos o mercado para que possa investir com segurança e total confiança."
      />

      <Reveal as="section" className="bg-surface py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-20">
          {posts.length === 0 ? (
            <p className="text-center text-on-surface-variant">Ainda não há artigos publicados.</p>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {posts.map((post) => (
                <article key={post.id} className="group flex flex-col overflow-hidden rounded-lg border border-outline-variant/20">
                  {post.featuredImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.featuredImageUrl}
                      alt={post.title}
                      className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="flex flex-1 flex-col p-6">
                    {post.categoryName ? (
                      <span className="mb-2 font-mono text-label-mono uppercase tracking-widest text-primary">
                        {post.categoryName}
                      </span>
                    ) : null}
                    <h2 className="mb-3 font-heading text-headline-md">{post.title}</h2>
                    {post.excerpt ? (
                      <p className="mb-6 flex-1 text-sm leading-relaxed text-on-surface-variant">{post.excerpt}</p>
                    ) : null}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-sm font-bold uppercase text-primary hover:underline"
                    >
                      Ler artigo →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}

          {hasNextPage ? (
            <div className="mt-16 text-center">
              <Link
                href={`/blog?page=${currentPage + 1}`}
                className="inline-flex items-center gap-2 rounded-lg bg-surface-container px-8 py-3 text-sm font-bold uppercase text-on-surface transition-colors hover:bg-surface-container-high"
              >
                Ler mais
              </Link>
            </div>
          ) : null}
        </div>
      </Reveal>
    </>
  );
}
