"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import DOMPurify from "isomorphic-dompurify";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/permissions";
import { blogPostSchema } from "@/lib/validations/blog-post";

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
            bodyHtml: DOMPurify.sanitize(bodyHtmlPt),
            seoTitle: seoTitlePt,
            seoDescription: seoDescriptionPt,
          },
          {
            locale: "EN",
            slug: slugEn,
            title: titleEn,
            excerpt: excerptEn,
            bodyHtml: DOMPurify.sanitize(bodyHtmlEn),
            seoTitle: seoTitleEn,
            seoDescription: seoDescriptionEn,
          },
        ],
      },
    },
  });

  revalidatePath("/admin/blog/posts");
  revalidatePath("/blog");
  redirect("/admin/blog/posts");
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
              bodyHtml: DOMPurify.sanitize(bodyHtmlPt),
              seoTitle: seoTitlePt,
              seoDescription: seoDescriptionPt,
            },
            create: {
              locale: "PT",
              slug: slugPt,
              title: titlePt,
              excerpt: excerptPt,
              bodyHtml: DOMPurify.sanitize(bodyHtmlPt),
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
              bodyHtml: DOMPurify.sanitize(bodyHtmlEn),
              seoTitle: seoTitleEn,
              seoDescription: seoDescriptionEn,
            },
            create: {
              locale: "EN",
              slug: slugEn,
              title: titleEn,
              excerpt: excerptEn,
              bodyHtml: DOMPurify.sanitize(bodyHtmlEn),
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
  redirect("/admin/blog/posts");
}

export async function deleteBlogPost(id: string) {
  await requireEditorOrAdmin();
  await prisma.blogPost.delete({ where: { id } });
  revalidatePath("/admin/blog/posts");
  revalidatePath("/blog");
}
