"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import sanitizeHtml from "sanitize-html";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/permissions";
import { blogPostSchema } from "@/lib/validations/blog-post";

// TipTap's StarterKit + Image extension (used by RichTextEditor) only ever
// emit this tag set. Uses sanitize-html (pure JS) instead of
// isomorphic-dompurify: the latter wraps jsdom, whose dynamic requires
// aren't reliably traced by Vercel's serverless bundler and crash the whole
// route at import time in production.
function sanitizeBody(html: string) {
  return sanitizeHtml(html, {
    allowedTags: [
      "p", "br", "hr", "strong", "b", "em", "i", "s", "u", "code", "pre",
      "h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "blockquote", "a", "img",
    ],
    allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt"] },
  });
}

function readForm(formData: FormData) {
  return {
    categoryId: formData.get("categoryId") || undefined,
    featuredImageUrl: formData.get("featuredImageUrl") || undefined,
    status: formData.get("status"),
    slugPt: formData.get("slugPt"),
    slugEn: formData.get("slugEn"),
    titlePt: formData.get("titlePt"),
    titleEn: formData.get("titleEn"),
    excerptPt: formData.get("excerptPt") || undefined,
    excerptEn: formData.get("excerptEn") || undefined,
    bodyHtmlPt: formData.get("bodyHtmlPt"),
    bodyHtmlEn: formData.get("bodyHtmlEn"),
    seoTitlePt: formData.get("seoTitlePt") || undefined,
    seoTitleEn: formData.get("seoTitleEn") || undefined,
    seoDescriptionPt: formData.get("seoDescriptionPt") || undefined,
    seoDescriptionEn: formData.get("seoDescriptionEn") || undefined,
  };
}

export async function createBlogPost(_prevState: string | undefined, formData: FormData) {
  const user = await requireEditorOrAdmin();
  const parsed = blogPostSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const {
    categoryId,
    featuredImageUrl,
    status,
    slugPt,
    slugEn,
    titlePt,
    titleEn,
    excerptPt,
    excerptEn,
    bodyHtmlPt,
    bodyHtmlEn,
    seoTitlePt,
    seoTitleEn,
    seoDescriptionPt,
    seoDescriptionEn,
  } = parsed.data;

  await prisma.blogPost.create({
    data: {
      categoryId: categoryId || null,
      authorId: user.id,
      featuredImageUrl,
      status,
      publishedAt: status === "PUBLISHED" ? new Date() : null,
      translations: {
        create: [
          {
            locale: "PT",
            slug: slugPt,
            title: titlePt,
            excerpt: excerptPt,
            bodyHtml: sanitizeBody(bodyHtmlPt),
            seoTitle: seoTitlePt,
            seoDescription: seoDescriptionPt,
          },
          {
            locale: "EN",
            slug: slugEn,
            title: titleEn,
            excerpt: excerptEn,
            bodyHtml: sanitizeBody(bodyHtmlEn),
            seoTitle: seoTitleEn,
            seoDescription: seoDescriptionEn,
          },
        ],
      },
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

  const {
    categoryId,
    featuredImageUrl,
    status,
    slugPt,
    slugEn,
    titlePt,
    titleEn,
    excerptPt,
    excerptEn,
    bodyHtmlPt,
    bodyHtmlEn,
    seoTitlePt,
    seoTitleEn,
    seoDescriptionPt,
    seoDescriptionEn,
  } = parsed.data;

  const current = await prisma.blogPost.findUnique({ where: { id } });

  await prisma.blogPost.update({
    where: { id },
    data: {
      categoryId: categoryId || null,
      featuredImageUrl,
      status,
      publishedAt: status === "PUBLISHED" && !current?.publishedAt ? new Date() : current?.publishedAt,
      translations: {
        upsert: [
          {
            where: { postId_locale: { postId: id, locale: "PT" } },
            update: {
              slug: slugPt,
              title: titlePt,
              excerpt: excerptPt,
              bodyHtml: sanitizeBody(bodyHtmlPt),
              seoTitle: seoTitlePt,
              seoDescription: seoDescriptionPt,
            },
            create: {
              locale: "PT",
              slug: slugPt,
              title: titlePt,
              excerpt: excerptPt,
              bodyHtml: sanitizeBody(bodyHtmlPt),
              seoTitle: seoTitlePt,
              seoDescription: seoDescriptionPt,
            },
          },
          {
            where: { postId_locale: { postId: id, locale: "EN" } },
            update: {
              slug: slugEn,
              title: titleEn,
              excerpt: excerptEn,
              bodyHtml: sanitizeBody(bodyHtmlEn),
              seoTitle: seoTitleEn,
              seoDescription: seoDescriptionEn,
            },
            create: {
              locale: "EN",
              slug: slugEn,
              title: titleEn,
              excerpt: excerptEn,
              bodyHtml: sanitizeBody(bodyHtmlEn),
              seoTitle: seoTitleEn,
              seoDescription: seoDescriptionEn,
            },
          },
        ],
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
