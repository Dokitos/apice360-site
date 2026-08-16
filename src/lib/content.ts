import { cache } from "react";
import { prisma } from "@/lib/prisma";

type Locale = "PT" | "EN";

export type PageKeyValue =
  | "HOME"
  | "QUEM_SOMOS"
  | "SERVICOS"
  | "PORTFOLIO"
  | "BLOG"
  | "CONTACTO"
  | "AREA_ARQUITETO";

const DEFAULT_LOCALE: Locale = "PT";
const FALLBACK_LOCALE: Locale = "EN";

function pickTranslation<T extends { locale: Locale }>(
  translations: T[],
  locale: Locale = DEFAULT_LOCALE,
): T | undefined {
  return (
    translations.find((t) => t.locale === locale) ??
    translations.find((t) => t.locale === FALLBACK_LOCALE)
  );
}

export const getSiteSettings = cache(async (locale: Locale = DEFAULT_LOCALE) => {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    include: { translations: true },
  });
  if (!settings) return null;

  const t = pickTranslation(settings.translations, locale);
  return { ...settings, t };
});

export const getCta = cache(async (key: string, locale: Locale = DEFAULT_LOCALE) => {
  const cta = await prisma.cta.findUnique({
    where: { key },
    include: { translations: true },
  });
  if (!cta || !cta.isActive) return null;

  const t = pickTranslation(cta.translations, locale);
  if (!t) return null;

  return { label: t.label, url: cta.url, iconName: cta.iconName, style: cta.style };
});

export const getPageSections = cache(
  async (page: PageKeyValue, locale: Locale = DEFAULT_LOCALE) => {
    const sections = await prisma.pageSection.findMany({
      where: { page, isActive: true },
      orderBy: { order: "asc" },
      include: {
        translations: true,
        items: { orderBy: { order: "asc" }, include: { translations: true } },
      },
    });

    return sections.map((section) => {
      const t = pickTranslation(section.translations, locale);
      return {
        key: section.key,
        imageUrl: section.imageUrl,
        iconName: section.iconName,
        eyebrow: t?.eyebrow ?? null,
        heading: t?.heading ?? null,
        subheading: t?.subheading ?? null,
        body: t?.body ?? null,
        ctaLabel: t?.ctaLabel ?? null,
        items: section.items.map((item) => {
          const it = pickTranslation(item.translations, locale);
          return {
            id: item.id,
            iconName: item.iconName,
            imageUrl: item.imageUrl,
            numberLabel: item.numberLabel,
            title: it?.title ?? "",
            body: it?.body ?? null,
          };
        }),
      };
    });
  },
);

export async function getPageSection(page: PageKeyValue, key: string, locale: Locale = DEFAULT_LOCALE) {
  const sections = await getPageSections(page, locale);
  return sections.find((s) => s.key === key) ?? null;
}

export const getStats = cache(async (locale: Locale = DEFAULT_LOCALE) => {
  const stats = await prisma.stat.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: { translations: true },
  });
  return stats.map((s) => ({
    id: s.id,
    value: s.value,
    iconName: s.iconName,
    label: pickTranslation(s.translations, locale)?.label ?? "",
  }));
});

export const getPartners = cache(async () => {
  return prisma.partner.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });
});

export const getTestimonials = cache(
  async (options: { onlyHome?: boolean } = {}, locale: Locale = DEFAULT_LOCALE) => {
    const testimonials = await prisma.testimonial.findMany({
      where: { isActive: true, ...(options.onlyHome ? { showOnHome: true } : {}) },
      orderBy: { order: "asc" },
      include: { translations: true },
    });
    return testimonials.map((t) => ({
      id: t.id,
      authorName: t.authorName,
      location: t.location,
      avatarUrl: t.avatarUrl,
      rating: t.rating,
      quote: pickTranslation(t.translations, locale)?.quote ?? "",
    }));
  },
);

export const getService = cache(
  async (type: "LSF" | "REMODELACAO", locale: Locale = DEFAULT_LOCALE) => {
    const service = await prisma.service.findUnique({
      where: { type },
      include: {
        translations: true,
        features: { orderBy: { order: "asc" }, include: { translations: true } },
      },
    });
    if (!service) return null;

    const t = pickTranslation(service.translations, locale);
    return {
      type: service.type,
      imageUrl: service.imageUrl,
      ctaKey: service.ctaKey,
      isActive: service.isActive,
      cardLabel: t?.cardLabel ?? "",
      title: t?.title ?? "",
      intro: t?.intro ?? "",
      features: service.features.map((f) => {
        const ft = pickTranslation(f.translations, locale);
        return { id: f.id, iconName: f.iconName, title: ft?.title ?? "", body: ft?.body ?? null };
      }),
    };
  },
);

export const getServices = cache(async (locale: Locale = DEFAULT_LOCALE) => {
  const [lsf, remodelacao] = await Promise.all([
    getService("LSF", locale),
    getService("REMODELACAO", locale),
  ]);
  return [lsf, remodelacao].filter(
    (s): s is NonNullable<typeof s> => s !== null && s.isActive,
  );
});

function mapProject<
  T extends {
    id: string;
    slug: string;
    category: "LSF" | "REMODELACAO";
    isFeatured: boolean;
    locationLabel: string | null;
    clientName: string | null;
    clientLocation: string | null;
    coverImageUrl: string | null;
    translations: {
      locale: Locale;
      title: string;
      shortDescription: string | null;
      challenge: string | null;
      methodology: string | null;
      result: string | null;
      testimonialQuote: string | null;
    }[];
    images?: { id: string; url: string; alt: string | null; order: number }[];
  },
>(project: T, locale: Locale) {
  const t = pickTranslation(project.translations, locale);
  return {
    id: project.id,
    slug: project.slug,
    category: project.category,
    isFeatured: project.isFeatured,
    locationLabel: project.locationLabel,
    clientName: project.clientName,
    clientLocation: project.clientLocation,
    coverImageUrl: project.coverImageUrl,
    title: t?.title ?? "",
    shortDescription: t?.shortDescription ?? null,
    challenge: t?.challenge ?? null,
    methodology: t?.methodology ?? null,
    result: t?.result ?? null,
    testimonialQuote: t?.testimonialQuote ?? null,
    images: project.images ?? [],
  };
}

export const getFeaturedProjects = cache(async (locale: Locale = DEFAULT_LOCALE) => {
  const projects = await prisma.portfolioProject.findMany({
    where: { isPublished: true, isFeatured: true },
    orderBy: { order: "asc" },
    include: { translations: true },
  });
  return projects.map((p) => mapProject(p, locale));
});

export const getProjectsByCategory = cache(
  async (category: "LSF" | "REMODELACAO", locale: Locale = DEFAULT_LOCALE) => {
    const projects = await prisma.portfolioProject.findMany({
      where: { isPublished: true, category },
      orderBy: { order: "asc" },
      include: { translations: true },
    });
    return projects.map((p) => mapProject(p, locale));
  },
);

export const getProject = cache(async (slug: string, locale: Locale = DEFAULT_LOCALE) => {
  const project = await prisma.portfolioProject.findUnique({
    where: { slug, isPublished: true },
    include: { translations: true, images: { orderBy: { order: "asc" } } },
  });
  if (!project) return null;
  return mapProject(project, locale);
});

export const countBlogPosts = cache(async (options: { categorySlug?: string } = {}, locale: Locale = DEFAULT_LOCALE) => {
  return prisma.blogPost.count({
    where: {
      status: "PUBLISHED",
      ...(options.categorySlug
        ? { category: { translations: { some: { locale, slug: options.categorySlug } } } }
        : {}),
    },
  });
});

export const getBlogPosts = cache(
  async (
    options: { limit?: number; skip?: number; categorySlug?: string } = {},
    locale: Locale = DEFAULT_LOCALE,
  ) => {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        ...(options.categorySlug
          ? { category: { translations: { some: { locale, slug: options.categorySlug } } } }
          : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: options.limit,
      skip: options.skip,
      include: { translations: true, category: { include: { translations: true } } },
    });

    return posts.map((p) => {
      const t = pickTranslation(p.translations, locale);
      const categoryT = p.category ? pickTranslation(p.category.translations, locale) : undefined;
      return {
        id: p.id,
        featuredImageUrl: p.featuredImageUrl,
        publishedAt: p.publishedAt,
        slug: t?.slug ?? "",
        title: t?.title ?? "",
        excerpt: t?.excerpt ?? null,
        categoryName: categoryT?.name ?? null,
      };
    });
  },
);

export const getBlogPost = cache(async (slug: string, locale: Locale = DEFAULT_LOCALE) => {
  const post = await prisma.blogPost.findFirst({
    where: { status: "PUBLISHED", translations: { some: { locale, slug } } },
    include: {
      translations: true,
      category: { include: { translations: true } },
      author: true,
    },
  });
  if (!post) return null;

  const t = pickTranslation(post.translations, locale);
  const categoryT = post.category ? pickTranslation(post.category.translations, locale) : undefined;

  return {
    id: post.id,
    featuredImageUrl: post.featuredImageUrl,
    publishedAt: post.publishedAt,
    authorName: post.author?.name ?? null,
    categoryId: post.categoryId,
    categoryName: categoryT?.name ?? null,
    slug: t?.slug ?? "",
    title: t?.title ?? "",
    excerpt: t?.excerpt ?? null,
    bodyHtml: t?.bodyHtml ?? "",
    seoTitle: t?.seoTitle ?? null,
    seoDescription: t?.seoDescription ?? null,
  };
});

export const getRelatedPosts = cache(
  async (postId: string, categoryId: string | null, locale: Locale = DEFAULT_LOCALE, limit = 3) => {
    const posts = await prisma.blogPost.findMany({
      where: {
        status: "PUBLISHED",
        id: { not: postId },
        ...(categoryId ? { categoryId } : {}),
      },
      orderBy: { publishedAt: "desc" },
      take: limit,
      include: { translations: true, category: { include: { translations: true } } },
    });
    return posts.map((p) => {
      const t = pickTranslation(p.translations, locale);
      const categoryT = p.category ? pickTranslation(p.category.translations, locale) : undefined;
      return {
        id: p.id,
        featuredImageUrl: p.featuredImageUrl,
        slug: t?.slug ?? "",
        title: t?.title ?? "",
        categoryName: categoryT?.name ?? null,
      };
    });
  },
);

export const getApprovedComments = cache(async (postId: string) => {
  return prisma.blogComment.findMany({
    where: { postId, status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });
});

export const getPageSeo = cache(async (page: PageKeyValue, locale: Locale = DEFAULT_LOCALE) => {
  const seo = await prisma.pageSeo.findUnique({
    where: { page },
    include: { translations: true },
  });
  if (!seo) return null;
  const t = pickTranslation(seo.translations, locale);
  if (!t) return null;
  return { title: t.title, description: t.description, ogImageUrl: seo.ogImageUrl };
});
