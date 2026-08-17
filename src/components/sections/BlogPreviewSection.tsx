import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  featuredImageUrl: string | null;
  categoryName: string | null;
};

type BlogPreviewSectionProps = {
  heading?: string | null;
  subheading?: string | null;
  posts: Post[];
  cta?: { label: string; url: string } | null;
  locale?: SiteLocale;
};

export function BlogPreviewSection({ heading, subheading, posts, cta, locale = "PT" }: BlogPreviewSectionProps) {
  if (posts.length === 0) return null;
  const dict = getDictionary(locale);

  return (
    <Reveal as="section" className="bg-surface py-32">
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <SectionHeading
          title={
            heading ?? (locale === "EN" ? "Learn from those who build at the highest level." : "Aprenda com quem constrói no mais alto nível.")
          }
          subtitle={subheading ?? undefined}
        />
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
                <h3 className="mb-3 font-heading text-headline-md">{post.title}</h3>
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
        {cta ? (
          <div className="mt-16 text-center">
            <Button href={cta.url} variant="ghost">
              {cta.label}
            </Button>
          </div>
        ) : null}
      </div>
    </Reveal>
  );
}
