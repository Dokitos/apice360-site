import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getRelatedPosts, getApprovedComments } from "@/lib/content";
import { Reveal } from "@/components/ui/Reveal";
import { Icon } from "@/components/ui/Icon";
import { CommentsSection } from "@/components/sections/CommentsSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return {};
  return { title: post.seoTitle ?? post.title, description: post.seoDescription ?? post.excerpt ?? undefined };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const [related, comments] = await Promise.all([
    getRelatedPosts(post.id, post.categoryId),
    getApprovedComments(post.id),
  ]);

  return (
    <Reveal as="article" className="py-24">
      <div className="mx-auto max-w-[800px] px-5 md:px-20">
        <Link
          href="/blog"
          className="mb-10 inline-flex items-center gap-2 rounded-lg bg-surface-container px-5 py-2.5 text-sm font-bold uppercase text-on-surface transition-colors hover:bg-surface-container-high"
        >
          <Icon name="arrow_back" /> Voltar aos Artigos
        </Link>

        <h1 className="mb-6 font-heading text-headline-lg">{post.title}</h1>

        <div className="mb-10 flex items-center justify-between border-b border-outline-variant/20 pb-6">
          <div className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
            {post.authorName ? `${post.authorName} · ` : ""}
            {post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "long", year: "numeric" })
              : ""}
          </div>
          <div className="flex gap-3 text-on-surface-variant">
            <Icon name="share" />
          </div>
        </div>

        {post.featuredImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.featuredImageUrl} alt={post.title} className="mb-10 h-[360px] w-full rounded-lg object-cover" />
        ) : null}

        {/* bodyHtml is sanitized with DOMPurify before being persisted from the admin rich-text editor. */}
        <div
          className="prose max-w-none leading-relaxed prose-headings:font-heading prose-a:text-primary"
          dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
        />

        <CommentsSection postId={post.id} postSlug={post.slug} comments={comments} />

        {related.length > 0 ? (
          <div className="mt-20 border-t border-outline-variant/20 pt-16">
            <h3 className="mb-8 font-heading text-headline-md">Artigos Relacionados</h3>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              {related.map((r) => (
                <Link key={r.id} href={`/blog/${r.slug}`} className="group">
                  {r.featuredImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.featuredImageUrl}
                      alt={r.title}
                      className="mb-3 h-32 w-full rounded-lg object-cover transition-transform group-hover:scale-105"
                    />
                  ) : null}
                  {r.categoryName ? (
                    <span className="mb-1 block font-mono text-label-mono uppercase tracking-widest text-primary">
                      {r.categoryName}
                    </span>
                  ) : null}
                  <p className="text-sm font-bold group-hover:text-primary">{r.title}</p>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}
