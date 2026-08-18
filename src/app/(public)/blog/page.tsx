import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts, countBlogPosts, getPageSeo, getPageSections } from "@/lib/content";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/dictionary";
import { PageIntroSection } from "@/components/sections/PageIntroSection";
import { GenericPageSection } from "@/components/sections/GenericPageSection";
import { Reveal } from "@/components/ui/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const seo = await getPageSeo("BLOG", locale);
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
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const [posts, total, extraSections] = await Promise.all([
    getBlogPosts({ limit: PAGE_SIZE, skip: (currentPage - 1) * PAGE_SIZE }, locale),
    countBlogPosts({}, locale),
    getPageSections("BLOG", locale),
  ]);

  const hasNextPage = currentPage * PAGE_SIZE < total;

  return (
    <>
      <PageIntroSection eyebrow={dict.blog.eyebrow} heading={dict.blog.heading} body={dict.blog.body} />

      <Reveal as="section" className="bg-surface py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-20">
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

      {extraSections.map((section, i) => (
        <GenericPageSection key={section.key} section={section} alt={i % 2 === 1} />
      ))}
    </>
  );
}
