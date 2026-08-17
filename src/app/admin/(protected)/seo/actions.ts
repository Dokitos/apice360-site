"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/permissions";
import { pageSeoSchema } from "@/lib/validations/page-seo";

type PageKeyValue =
  | "HOME"
  | "QUEM_SOMOS"
  | "SERVICOS"
  | "PORTFOLIO"
  | "BLOG"
  | "CONTACTO"
  | "AREA_ARQUITETO";

function readForm(formData: FormData) {
  return {
    ogImageUrl: formData.get("ogImageUrl") || undefined,
    titlePt: formData.get("titlePt"),
    titleEn: formData.get("titleEn"),
    descriptionPt: formData.get("descriptionPt"),
    descriptionEn: formData.get("descriptionEn"),
  };
}

export async function upsertPageSeo(
  page: PageKeyValue,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requireEditorOrAdmin();
  const parsed = pageSeoSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { titlePt, titleEn, descriptionPt, descriptionEn, ogImageUrl } = parsed.data;

  const existing = await prisma.pageSeo.findUnique({ where: { page } });

  if (existing) {
    await prisma.pageSeo.update({
      where: { page },
      data: {
        ogImageUrl,
        translations: {
          upsert: [
            {
              where: { pageSeoId_locale: { pageSeoId: existing.id, locale: "PT" } },
              update: { title: titlePt, description: descriptionPt },
              create: { locale: "PT", title: titlePt, description: descriptionPt },
            },
            {
              where: { pageSeoId_locale: { pageSeoId: existing.id, locale: "EN" } },
              update: { title: titleEn, description: descriptionEn },
              create: { locale: "EN", title: titleEn, description: descriptionEn },
            },
          ],
        },
      },
    });
  } else {
    await prisma.pageSeo.create({
      data: {
        page,
        ogImageUrl,
        translations: {
          create: [
            { locale: "PT", title: titlePt, description: descriptionPt },
            { locale: "EN", title: titleEn, description: descriptionEn },
          ],
        },
      },
    });
  }

  revalidatePath("/admin/seo");
  revalidatePath("/");
  redirect(`/admin/seo/${page}?saved=1`);
}
