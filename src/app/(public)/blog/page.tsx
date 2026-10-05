import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { getBlogPosts, countBlogPosts, getPageSeo, getPageSection, getSiteSettings, getPageSections, getCta } from "@/lib/content";
import { notFound } from "next/navigation";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/dictionary";
import { PageIntroSection } from "@/components/sections/PageIntroSection";
import { OrderedSections } from "@/components/sections/OrderedSections";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const seo = await getPageSeo("BLOG", locale);
  if (!seo) return {};
  return {
    title: seo.title,
    description: seo.description,
    alternates: { canonical: "/blog" },
    openGraph: {
      title: seo.title,
      description: seo.description,
      url: "/blog",
      images: seo.ogImageUrl ? [seo.ogImageUrl] : undefined,
    },
  };
}

const PAGE_SIZE = 6;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const [posts, total, allSections, intro, settings] = await Promise.all([
    getBlogPosts({ limit: PAGE_SIZE, skip: (currentPage - 1) * PAGE_SIZE }, locale),
    countBlogPosts({}, locale),
    getPageSections("BLOG", locale),
    getPageSection("BLOG", "intro", locale),
    getSiteSettings(locale),
  ]);

  // Blog desligado nas Definições do Site: a rota deixa de existir, para o
  // link directo não ser uma porta das traseiras para conteúdo escondido.
  if (settings?.blogEnabled === false) notFound();
  const introCta = intro?.ctaKey ? await getCta(intro.ctaKey, locale) : null;

  const hasNextPage = currentPage * PAGE_SIZE < total;

  const blocos: Record<string, ReactNode> = {
    intro: (
      <PageIntroSection
        eyebrow={intro?.eyebrow ?? dict.blog.eyebrow}
        heading={intro?.heading ?? dict.blog.heading}
        body={intro?.body ?? dict.blog.body}
        imageUrl={intro?.imageUrl}
        items={intro?.items}
        cta={introCta}
      />
    ),
    // A lista de artigos vem do separador "Artigos"; esta secção define
    // apenas onde ela aparece na página.
    posts: (
      <Reveal as="section" className="bg-surface py-24">
        <div className="mx-auto max-w-site px-5 md:px-20">
          {posts.length === 0 ? (
            <p className="text-center text-on-surface-variant">{dict.blog.semArtigos}</p>
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
                      {dict.blog.lerArtigo}
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
                {dict.blog.lerMais}
              </Link>
            </div>
          ) : null}
        </div>
      </Reveal>
    ),
  };

  return (
    <>
      <OrderedSections sections={allSections} blocks={blocos} locale={locale} />
    </>
  );
}
