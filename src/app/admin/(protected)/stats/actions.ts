"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { statSchema } from "@/lib/validations/stat";
import { resolveTranslations, type ExistingTranslationRow } from "@/lib/auto-translate";

const TRANSLATABLE_FIELDS = [{ key: "label" }];

function readForm(formData: FormData) {
  return {
    value: formData.get("value"),
    iconName: formData.get("iconName") || undefined,
    order: formData.get("order"),
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

export async function createStat(_prevState: string | undefined, formData: FormData) {
  await requirePermission("stats", "create");
  const parsed = statSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { labelPt, labelEn, labelEs, labelFr, ...data } = parsed.data;
  const translations = await buildTranslationsPayload({ labelPt, labelEn, labelEs, labelFr }, []);

  await prisma.stat.create({
    data: {
      ...data,
      translations: { create: translations },
    },
  });
  revalidatePath("/admin/stats");
  revalidatePath("/");
  redirect("/admin/stats?saved=1");
}

export async function updateStat(id: string, _prevState: string | undefined, formData: FormData) {
  await requirePermission("stats", "edit");
  const parsed = statSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { labelPt, labelEn, labelEs, labelFr, ...data } = parsed.data;
  const current = await prisma.stat.findUnique({ where: { id }, select: { translations: true } });
  const translations = await buildTranslationsPayload({ labelPt, labelEn, labelEs, labelFr }, current?.translations ?? []);

  await prisma.stat.update({
    where: { id },
    data: {
      ...data,
      iconName: data.iconName || null,
      translations: {
        upsert: translations.map((t) => ({
          where: { statId_locale: { statId: id, locale: t.locale } },
          update: { label: t.label, isAutoTranslated: t.isAutoTranslated },
          create: t,
        })),
      },
    },
  });
  revalidatePath("/admin/stats");
  revalidatePath("/");
  redirect("/admin/stats?saved=1");
}

export async function deleteStat(id: string) {
  await requirePermission("stats", "delete");
  await prisma.stat.delete({ where: { id } });
  revalidatePath("/admin/stats");
  revalidatePath("/");
}
