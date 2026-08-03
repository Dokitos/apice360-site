"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/permissions";
import { blogCategorySchema } from "@/lib/validations/blog-category";

function readForm(formData: FormData) {
  return {
    order: formData.get("order"),
    namePt: formData.get("namePt"),
    nameEn: formData.get("nameEn"),
    slugPt: formData.get("slugPt"),
    slugEn: formData.get("slugEn"),
  };
}

export async function createBlogCategory(_prevState: string | undefined, formData: FormData) {
  await requireEditorOrAdmin();
  const parsed = blogCategorySchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { namePt, nameEn, slugPt, slugEn, order } = parsed.data;
  await prisma.blogCategory.create({
    data: {
      order,
      translations: {
        create: [
          { locale: "PT", name: namePt, slug: slugPt },
          { locale: "EN", name: nameEn, slug: slugEn },
        ],
      },
    },
  });
  revalidatePath("/admin/blog/categories");
  revalidatePath("/blog");
  redirect("/admin/blog/categories");
}

export async function updateBlogCategory(
  id: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requireEditorOrAdmin();
  const parsed = blogCategorySchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { namePt, nameEn, slugPt, slugEn, order } = parsed.data;
  await prisma.blogCategory.update({
    where: { id },
    data: {
      order,
      translations: {
        upsert: [
          {
            where: { categoryId_locale: { categoryId: id, locale: "PT" } },
            update: { name: namePt, slug: slugPt },
            create: { locale: "PT", name: namePt, slug: slugPt },
          },
          {
            where: { categoryId_locale: { categoryId: id, locale: "EN" } },
            update: { name: nameEn, slug: slugEn },
            create: { locale: "EN", name: nameEn, slug: slugEn },
          },
        ],
      },
    },
  });
  revalidatePath("/admin/blog/categories");
  revalidatePath("/blog");
  redirect("/admin/blog/categories");
}

export async function deleteBlogCategory(id: string) {
  await requireEditorOrAdmin();
  await prisma.blogCategory.delete({ where: { id } });
  revalidatePath("/admin/blog/categories");
  revalidatePath("/blog");
}
