"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { pageSeoSchema } from "@/lib/validations/page-seo";
import { resolveTranslations, type ExistingTranslationRow } from "@/lib/auto-translate";

type PageKeyValue =
  | "HOME"
  | "QUEM_SOMOS"
  | "SERVICOS"
  | "PORTFOLIO"
  | "BLOG"
  | "CONTACTO"
  | "AREA_ARQUITETO"
  | "LP";

const SEO_FIELDS = [{ key: "title" }, { key: "description" }];

function readForm(formData: FormData) {
  return {
    ogImageUrl: formData.get("ogImageUrl") || undefined,
    titlePt: formData.get("titlePt"),
    titleEn: formData.get("titleEn"),
    titleEs: formData.get("titleEs"),
    titleFr: formData.get("titleFr"),
    descriptionPt: formData.get("descriptionPt"),
    descriptionEn: formData.get("descriptionEn"),
    descriptionEs: formData.get("descriptionEs"),
    descriptionFr: formData.get("descriptionFr"),
  };
}

async function buildSeoTranslations(
  data: {
    titlePt: string; descriptionPt: string;
    titleEn?: string; descriptionEn?: string;
    titleEs?: string; descriptionEs?: string;
    titleFr?: string; descriptionFr?: string;
  },
  existingTranslations: ExistingTranslationRow[],
) {
  const resolved = await resolveTranslations({
    fields: SEO_FIELDS,
    ptValues: { title: data.titlePt, description: data.descriptionPt },
    submittedValues: {
      EN: { title: data.titleEn ?? null, description: data.descriptionEn ?? null },
      ES: { title: data.titleEs ?? null, description: data.descriptionEs ?? null },
      FR: { title: data.titleFr ?? null, description: data.descriptionFr ?? null },
    },
    existingTranslations,
  });

  return [
    { locale: "PT" as const, isAutoTranslated: false, title: data.titlePt, description: data.descriptionPt },
    ...resolved.map((r) => ({
      locale: r.locale,
      isAutoTranslated: r.isAutoTranslated,
      title: r.fields.title ?? "",
      description: r.fields.description ?? "",
    })),
  ];
}

export async function upsertPageSeo(
  page: PageKeyValue,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requirePermission("seo", "edit");
  const parsed = pageSeoSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { titlePt, titleEn, titleEs, titleFr, descriptionPt, descriptionEn, descriptionEs, descriptionFr, ogImageUrl } = parsed.data;

  const existing = await prisma.pageSeo.findUnique({ where: { page }, include: { translations: true } });
  const translations = await buildSeoTranslations(
    { titlePt, descriptionPt, titleEn, descriptionEn, titleEs, descriptionEs, titleFr, descriptionFr },
    existing?.translations ?? [],
  );

  if (existing) {
    await prisma.pageSeo.update({
      where: { page },
      data: {
        ogImageUrl,
        translations: {
          upsert: translations.map((t) => {
            const { locale, ...fields } = t;
            return {
              where: { pageSeoId_locale: { pageSeoId: existing.id, locale } },
              update: fields,
              create: t,
            };
          }),
        },
      },
    });
  } else {
    await prisma.pageSeo.create({
      data: {
        page,
        ogImageUrl,
        translations: { create: translations },
      },
    });
  }

  revalidatePath("/admin/seo");
  revalidatePath("/");
  redirect(`/admin/seo/${page}?saved=1`);
}
