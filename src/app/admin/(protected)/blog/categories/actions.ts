"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { blogCategorySchema } from "@/lib/validations/blog-category";
import { slugify } from "@/lib/slugify";
import { resolveTranslations, type ExistingTranslationRow } from "@/lib/auto-translate";

const CATEGORY_FIELDS = [{ key: "name" }];

function readForm(formData: FormData) {
  return {
    order: formData.get("order"),
    namePt: formData.get("namePt"),
    nameEn: formData.get("nameEn"),
    nameEs: formData.get("nameEs"),
    nameFr: formData.get("nameFr"),
    slugPt: formData.get("slugPt"),
    slugEn: formData.get("slugEn"),
    slugEs: formData.get("slugEs"),
    slugFr: formData.get("slugFr"),
  };
}

async function buildCategoryTranslations(
  data: {
    namePt: string; slugPt: string;
    nameEn?: string; slugEn?: string;
    nameEs?: string; slugEs?: string;
    nameFr?: string; slugFr?: string;
  },
  existingTranslations: ExistingTranslationRow[],
) {
  // The slug isn't routed through DeepL (translating a URL slug as prose
  // makes no sense) — it's derived from the translated name for
  // auto-managed locales, or taken verbatim from the form for locales the
  // editor has manually claimed (same as the "name" field's own rule).
  const resolved = await resolveTranslations({
    fields: CATEGORY_FIELDS,
    ptValues: { name: data.namePt },
    submittedValues: {
      EN: { name: data.nameEn ?? null },
      ES: { name: data.nameEs ?? null },
      FR: { name: data.nameFr ?? null },
    },
    existingTranslations,
  });

  const submittedSlugs = { EN: data.slugEn, ES: data.slugEs, FR: data.slugFr };

  return [
    { locale: "PT" as const, isAutoTranslated: false, name: data.namePt, slug: data.slugPt },
    ...resolved.map((r) => ({
      locale: r.locale,
      isAutoTranslated: r.isAutoTranslated,
      name: r.fields.name ?? "",
      slug: r.isAutoTranslated
        ? slugify(r.fields.name ?? "")
        : submittedSlugs[r.locale] || slugify(r.fields.name ?? ""),
    })),
  ];
}

export async function createBlogCategory(_prevState: string | undefined, formData: FormData) {
  await requirePermission("blog_categories", "create");
  const parsed = blogCategorySchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { namePt, nameEn, nameEs, nameFr, slugPt, slugEn, slugEs, slugFr, order } = parsed.data;
  const translations = await buildCategoryTranslations(
    { namePt, slugPt, nameEn, slugEn, nameEs, slugEs, nameFr, slugFr },
    [],
  );

  await prisma.blogCategory.create({
    data: {
      order,
      translations: { create: translations },
    },
  });
  revalidatePath("/admin/blog/categories");
  revalidatePath("/blog");
  redirect("/admin/blog/categories?saved=1");
}

export async function updateBlogCategory(
  id: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requirePermission("blog_categories", "edit");
  const parsed = blogCategorySchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { namePt, nameEn, nameEs, nameFr, slugPt, slugEn, slugEs, slugFr, order } = parsed.data;
  const current = await prisma.blogCategory.findUnique({ where: { id }, select: { translations: true } });
  const translations = await buildCategoryTranslations(
    { namePt, slugPt, nameEn, slugEn, nameEs, slugEs, nameFr, slugFr },
    current?.translations ?? [],
  );

  await prisma.blogCategory.update({
    where: { id },
    data: {
      order,
      translations: {
        upsert: translations.map((t) => {
          const { locale, ...fields } = t;
          return {
            where: { categoryId_locale: { categoryId: id, locale } },
            update: fields,
            create: t,
          };
        }),
      },
    },
  });
  revalidatePath("/admin/blog/categories");
  revalidatePath("/blog");
  redirect("/admin/blog/categories?saved=1");
}

export async function deleteBlogCategory(id: string) {
  await requirePermission("blog_categories", "delete");
  await prisma.blogCategory.delete({ where: { id } });
  revalidatePath("/admin/blog/categories");
  revalidatePath("/blog");
}
