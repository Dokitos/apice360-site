"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/permissions";
import { blogPostSchema } from "@/lib/validations/blog-post";
import { sanitizeRichText as sanitizeBody } from "@/lib/sanitize-rich-text";
import { slugify } from "@/lib/slugify";
import { resolveTranslations, type ExistingTranslationRow, type SecondaryLocale } from "@/lib/auto-translate";

const POST_FIELDS = [
  { key: "title" },
  { key: "excerpt" },
  { key: "bodyHtml", isHtml: true },
  { key: "seoTitle" },
  { key: "seoDescription" },
];

function readForm(formData: FormData) {
  return {
    categoryId: formData.get("categoryId") || undefined,
    featuredImageUrl: formData.get("featuredImageUrl") || undefined,
    status: formData.get("status"),
    slugPt: formData.get("slugPt"),
    slugEn: formData.get("slugEn"),
    slugEs: formData.get("slugEs"),
    slugFr: formData.get("slugFr"),
    titlePt: formData.get("titlePt"),
    titleEn: formData.get("titleEn"),
    titleEs: formData.get("titleEs"),
    titleFr: formData.get("titleFr"),
    excerptPt: formData.get("excerptPt") || undefined,
    excerptEn: formData.get("excerptEn") || undefined,
    excerptEs: formData.get("excerptEs") || undefined,
    excerptFr: formData.get("excerptFr") || undefined,
    bodyHtmlPt: formData.get("bodyHtmlPt"),
    bodyHtmlEn: formData.get("bodyHtmlEn"),
    bodyHtmlEs: formData.get("bodyHtmlEs"),
    bodyHtmlFr: formData.get("bodyHtmlFr"),
    seoTitlePt: formData.get("seoTitlePt") || undefined,
    seoTitleEn: formData.get("seoTitleEn") || undefined,
    seoTitleEs: formData.get("seoTitleEs") || undefined,
    seoTitleFr: formData.get("seoTitleFr") || undefined,
    seoDescriptionPt: formData.get("seoDescriptionPt") || undefined,
    seoDescriptionEn: formData.get("seoDescriptionEn") || undefined,
    seoDescriptionEs: formData.get("seoDescriptionEs") || undefined,
    seoDescriptionFr: formData.get("seoDescriptionFr") || undefined,
  };
}

async function buildPostTranslations(
  data: {
    titlePt: string; slugPt: string; excerptPt?: string; bodyHtmlPt: string; seoTitlePt?: string; seoDescriptionPt?: string;
    titleEn?: string; slugEn?: string; excerptEn?: string; bodyHtmlEn?: string; seoTitleEn?: string; seoDescriptionEn?: string;
    titleEs?: string; slugEs?: string; excerptEs?: string; bodyHtmlEs?: string; seoTitleEs?: string; seoDescriptionEs?: string;
    titleFr?: string; slugFr?: string; excerptFr?: string; bodyHtmlFr?: string; seoTitleFr?: string; seoDescriptionFr?: string;
  },
  existingTranslations: ExistingTranslationRow[],
) {
  const ptBody = sanitizeBody(data.bodyHtmlPt);

  const resolved = await resolveTranslations({
    fields: POST_FIELDS,
    ptValues: {
      title: data.titlePt,
      excerpt: data.excerptPt ?? null,
      bodyHtml: ptBody,
      seoTitle: data.seoTitlePt ?? null,
      seoDescription: data.seoDescriptionPt ?? null,
    },
    submittedValues: {
      EN: { title: data.titleEn ?? null, excerpt: data.excerptEn ?? null, bodyHtml: data.bodyHtmlEn ?? null, seoTitle: data.seoTitleEn ?? null, seoDescription: data.seoDescriptionEn ?? null },
      ES: { title: data.titleEs ?? null, excerpt: data.excerptEs ?? null, bodyHtml: data.bodyHtmlEs ?? null, seoTitle: data.seoTitleEs ?? null, seoDescription: data.seoDescriptionEs ?? null },
      FR: { title: data.titleFr ?? null, excerpt: data.excerptFr ?? null, bodyHtml: data.bodyHtmlFr ?? null, seoTitle: data.seoTitleFr ?? null, seoDescription: data.seoDescriptionFr ?? null },
    },
    existingTranslations,
  });

  const submittedSlugs: Record<SecondaryLocale, string | undefined> = { EN: data.slugEn, ES: data.slugEs, FR: data.slugFr };

  return [
    {
      locale: "PT" as const,
      isAutoTranslated: false,
      slug: data.slugPt,
      title: data.titlePt,
      excerpt: data.excerptPt ?? null,
      bodyHtml: ptBody,
      seoTitle: data.seoTitlePt ?? null,
      seoDescription: data.seoDescriptionPt ?? null,
    },
    ...resolved.map((r) => ({
      locale: r.locale,
      isAutoTranslated: r.isAutoTranslated,
      slug: r.isAutoTranslated
        ? slugify(r.fields.title ?? "")
        : submittedSlugs[r.locale] || slugify(r.fields.title ?? ""),
      title: r.fields.title ?? "",
      excerpt: r.fields.excerpt,
      bodyHtml: r.fields.bodyHtml ? sanitizeBody(r.fields.bodyHtml) : "",
      seoTitle: r.fields.seoTitle,
      seoDescription: r.fields.seoDescription,
    })),
  ];
}

export async function createBlogPost(_prevState: string | undefined, formData: FormData) {
  const user = await requireEditorOrAdmin();
  const parsed = blogPostSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { categoryId, featuredImageUrl, status, ...rest } = parsed.data;
  const translations = await buildPostTranslations(rest, []);

  await prisma.blogPost.create({
    data: {
      categoryId: categoryId || null,
      authorId: user.id,
      featuredImageUrl,
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      translations: { create: translations },
    },
  });

  revalidatePath("/admin/blog/posts");
  revalidatePath("/blog");
  redirect("/admin/blog/posts?saved=1");
}

export async function updateBlogPost(
  id: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requireEditorOrAdmin();
  const parsed = blogPostSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { categoryId, featuredImageUrl, status, ...rest } = parsed.data;

  const current = await prisma.blogPost.findUnique({ where: { id }, include: { translations: true } });
  const translations = await buildPostTranslations(rest, current?.translations ?? []);

  await prisma.blogPost.update({
    where: { id },
    data: {
      categoryId: categoryId || null,
      featuredImageUrl,
      status,
      publishedAt: status === "PUBLISHED" && !current?.publishedAt ? new Date() : current?.publishedAt,
      translations: {
        upsert: translations.map((t) => {
          const { locale, ...fields } = t;
          return {
            where: { postId_locale: { postId: id, locale } },
            update: fields,
            create: t,
          };
        }),
      },
    },
  });

  revalidatePath("/admin/blog/posts");
  revalidatePath("/blog");
  redirect("/admin/blog/posts?saved=1");
}

export async function deleteBlogPost(id: string) {
  await requireEditorOrAdmin();
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog/posts");
  revalidatePath("/blog");
}
