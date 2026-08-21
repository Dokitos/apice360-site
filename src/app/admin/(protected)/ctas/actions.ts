"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { ctaSchema } from "@/lib/validations/cta";
import { resolveTranslations, type ExistingTranslationRow } from "@/lib/auto-translate";

const TRANSLATABLE_FIELDS = [{ key: "label" }];

function readForm(formData: FormData) {
  return {
    key: formData.get("key"),
    url: formData.get("url"),
    style: formData.get("style") || "primary",
    iconName: formData.get("iconName") || undefined,
    isActive: formData.get("isActive") === "on",
    labelPt: formData.get("labelPt"),
    labelEn: formData.get("labelEn"),
    labelEs: formData.get("labelEs"),
    labelFr: formData.get("labelFr"),
  };
}

async function buildTranslationsPayload(
  data: { labelPt: string; labelEn?: string; labelEs?: string; labelFr?: string },
  existingTranslations: ExistingTranslationRow[],
) {
  const resolved = await resolveTranslations({
    fields: TRANSLATABLE_FIELDS,
    ptValues: { label: data.labelPt },
    submittedValues: {
      EN: { label: data.labelEn ?? null },
      ES: { label: data.labelEs ?? null },
      FR: { label: data.labelFr ?? null },
    },
    existingTranslations,
  });

  return [
    { locale: "PT" as const, isAutoTranslated: false, label: data.labelPt },
    ...resolved.map((r) => ({ locale: r.locale, isAutoTranslated: r.isAutoTranslated, label: r.fields.label ?? "" })),
  ];
}

export async function createCta(_prevState: string | undefined, formData: FormData) {
  await requirePermission("ctas", "create");
  const parsed = ctaSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { labelPt, labelEn, labelEs, labelFr, ...data } = parsed.data;

  const existing = await prisma.cta.findUnique({ where: { key: data.key } });
  if (existing) return "Já existe um CTA com esta chave.";

  const linkedSectionId = (formData.get("linkedSectionId") as string) || undefined;
  const translations = await buildTranslationsPayload({ labelPt, labelEn, labelEs, labelFr }, []);

  await prisma.cta.create({
    data: {
      ...data,
      iconName: data.iconName || null,
      translations: { create: translations },
    },
  });

  if (linkedSectionId) {
    await prisma.pageSection.update({ where: { id: linkedSectionId }, data: { ctaKey: data.key } });
  }

  revalidatePath("/admin/ctas");
  revalidatePath("/admin/page-sections");
  revalidatePath("/");
  redirect("/admin/ctas?saved=1");
}

export async function updateCta(id: string, _prevState: string | undefined, formData: FormData) {
  await requirePermission("ctas", "edit");
  const parsed = ctaSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { labelPt, labelEn, labelEs, labelFr, ...data } = parsed.data;

  const current = await prisma.cta.findUnique({ where: { id }, select: { translations: true } });
  const translations = await buildTranslationsPayload(
    { labelPt, labelEn, labelEs, labelFr },
    current?.translations ?? [],
  );

  await prisma.cta.update({
    where: { id },
    data: {
      ...data,
      // `iconName` comes through as `undefined` when the admin clears the
      // icon picker — Prisma treats an undefined field as "don't touch",
      // which would silently keep the old icon. Coerce to null so clearing
      // it actually persists.
      iconName: data.iconName || null,
      translations: {
        upsert: translations.map((t) => ({
          where: { ctaId_locale: { ctaId: id, locale: t.locale } },
          update: { label: t.label, isAutoTranslated: t.isAutoTranslated },
          create: t,
        })),
      },
    },
  });
  revalidatePath("/admin/ctas");
  revalidatePath("/");
  redirect("/admin/ctas?saved=1");
}

export async function deleteCta(id: string) {
  await requirePermission("ctas", "delete");
  await prisma.cta.delete({ where: { id } });
  revalidatePath("/admin/ctas");
  revalidatePath("/");
}
