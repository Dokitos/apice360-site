"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { lpPriceTierSchema } from "@/lib/validations/lp-price-tier";
import { resolveTranslations, type ExistingTranslationRow } from "@/lib/auto-translate";

const TRANSLATABLE_FIELDS = [{ key: "label" }, { key: "description" }, { key: "features" }];

function readForm(formData: FormData) {
  return {
    key: formData.get("key"),
    pricePerM2: formData.get("pricePerM2"),
    order: formData.get("order"),
    isHighlighted: formData.get("isHighlighted") === "on",
    isActive: formData.get("isActive") === "on",
    iconName: formData.get("iconName") || undefined,
    labelPt: formData.get("labelPt"),
    labelEn: formData.get("labelEn") || undefined,
    labelEs: formData.get("labelEs") || undefined,
    labelFr: formData.get("labelFr") || undefined,
    descriptionPt: formData.get("descriptionPt") || undefined,
    descriptionEn: formData.get("descriptionEn") || undefined,
    descriptionEs: formData.get("descriptionEs") || undefined,
    descriptionFr: formData.get("descriptionFr") || undefined,
    featuresPt: formData.get("featuresPt") || undefined,
    featuresEn: formData.get("featuresEn") || undefined,
    featuresEs: formData.get("featuresEs") || undefined,
    featuresFr: formData.get("featuresFr") || undefined,
  };
}

type TranslatableInput = {
  labelPt: string;
  labelEn?: string;
  labelEs?: string;
  labelFr?: string;
  descriptionPt?: string;
  descriptionEn?: string;
  descriptionEs?: string;
  descriptionFr?: string;
  featuresPt?: string;
  featuresEn?: string;
  featuresEs?: string;
  featuresFr?: string;
};

async function buildTranslations(data: TranslatableInput, existingTranslations: ExistingTranslationRow[]) {
  const resolved = await resolveTranslations({
    fields: TRANSLATABLE_FIELDS,
    ptValues: {
      label: data.labelPt,
      description: data.descriptionPt ?? null,
      features: data.featuresPt ?? null,
    },
    submittedValues: {
      EN: { label: data.labelEn ?? null, description: data.descriptionEn ?? null, features: data.featuresEn ?? null },
      ES: { label: data.labelEs ?? null, description: data.descriptionEs ?? null, features: data.featuresEs ?? null },
      FR: { label: data.labelFr ?? null, description: data.descriptionFr ?? null, features: data.featuresFr ?? null },
    },
    existingTranslations,
  });

  return [
    {
      locale: "PT" as const,
      isAutoTranslated: false,
      label: data.labelPt,
      description: data.descriptionPt ?? null,
      features: data.featuresPt ?? null,
    },
    ...resolved.map((r) => ({
      locale: r.locale,
      isAutoTranslated: r.isAutoTranslated,
      // O rótulo é obrigatório na tabela: se a tradução falhar, fica o PT.
      label: r.fields.label || data.labelPt,
      description: r.fields.description,
      features: r.fields.features,
    })),
  ];
}

/** A LP e o painel de leads leem estes valores — invalida ambos ao guardar. */
function revalidateLp() {
  revalidatePath("/admin/landing-page");
  revalidatePath("/lp");
}

export async function createLpPriceTier(_prevState: string | undefined, formData: FormData) {
  await requirePermission("landing_page", "create");
  const parsed = lpPriceTierSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { labelPt, labelEn, labelEs, labelFr, descriptionPt, descriptionEn, descriptionEs, descriptionFr,
    featuresPt, featuresEn, featuresEs, featuresFr, iconName, ...data } = parsed.data;

  const existing = await prisma.lpPriceTier.findUnique({ where: { key: data.key }, select: { id: true } });
  if (existing) return "Já existe um escalão com essa chave.";

  const translations = await buildTranslations(
    { labelPt, labelEn, labelEs, labelFr, descriptionPt, descriptionEn, descriptionEs, descriptionFr,
      featuresPt, featuresEn, featuresEs, featuresFr },
    [],
  );

  await prisma.lpPriceTier.create({
    data: { ...data, iconName: iconName || null, translations: { create: translations } },
  });

  revalidateLp();
  redirect("/admin/landing-page?saved=1");
}

export async function updateLpPriceTier(id: string, _prevState: string | undefined, formData: FormData) {
  await requirePermission("landing_page", "edit");
  const parsed = lpPriceTierSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { labelPt, labelEn, labelEs, labelFr, descriptionPt, descriptionEn, descriptionEs, descriptionFr,
    featuresPt, featuresEn, featuresEs, featuresFr, iconName, ...data } = parsed.data;

  const clash = await prisma.lpPriceTier.findUnique({ where: { key: data.key }, select: { id: true } });
  if (clash && clash.id !== id) return "Já existe outro escalão com essa chave.";

  const current = await prisma.lpPriceTier.findUnique({ where: { id }, select: { translations: true } });
  const translations = await buildTranslations(
    { labelPt, labelEn, labelEs, labelFr, descriptionPt, descriptionEn, descriptionEs, descriptionFr,
      featuresPt, featuresEn, featuresEs, featuresFr },
    current?.translations ?? [],
  );

  await prisma.lpPriceTier.update({
    where: { id },
    data: {
      ...data,
      iconName: iconName || null,
      translations: {
        upsert: translations.map((t) => {
          const { locale, ...fields } = t;
          return {
            where: { tierId_locale: { tierId: id, locale } },
            update: fields,
            create: t,
          };
        }),
      },
    },
  });

  revalidateLp();
  redirect("/admin/landing-page?saved=1");
}

export async function deleteLpPriceTier(id: string) {
  await requirePermission("landing_page", "delete");
  await prisma.lpPriceTier.delete({ where: { id } });
  revalidateLp();
}
