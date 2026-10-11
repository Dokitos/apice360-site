"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { lpPriceTierSchema } from "@/lib/validations/lp-price-tier";
import { lpSimulatorFieldSchema, RESERVED_FIELD_KEYS } from "@/lib/validations/lp-simulator-field";
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

// ---------------------------------------------------------------------------
// Campos do formulário do simulador
// ---------------------------------------------------------------------------

const FIELD_TRANSLATABLE = [{ key: "label" }, { key: "hint" }, { key: "options" }];

function readFieldForm(formData: FormData) {
  return {
    key: formData.get("key"),
    type: formData.get("type"),
    step: formData.get("step"),
    order: formData.get("order"),
    isRequired: formData.get("isRequired") === "on",
    isActive: formData.get("isActive") === "on",
    isHalfWidth: formData.get("isHalfWidth") === "on",
    labelPt: formData.get("labelPt"),
    labelEn: formData.get("labelEn") || undefined,
    labelEs: formData.get("labelEs") || undefined,
    labelFr: formData.get("labelFr") || undefined,
    hintPt: formData.get("hintPt") || undefined,
    hintEn: formData.get("hintEn") || undefined,
    hintEs: formData.get("hintEs") || undefined,
    hintFr: formData.get("hintFr") || undefined,
    optionsPt: formData.get("optionsPt") || undefined,
    optionsEn: formData.get("optionsEn") || undefined,
    optionsEs: formData.get("optionsEs") || undefined,
    optionsFr: formData.get("optionsFr") || undefined,
  };
}

type FieldTranslatableInput = {
  labelPt: string;
  labelEn?: string;
  labelEs?: string;
  labelFr?: string;
  hintPt?: string;
  hintEn?: string;
  hintEs?: string;
  hintFr?: string;
  optionsPt?: string;
  optionsEn?: string;
  optionsEs?: string;
  optionsFr?: string;
};

async function buildFieldTranslations(
  data: FieldTranslatableInput,
  existingTranslations: ExistingTranslationRow[],
) {
  const resolved = await resolveTranslations({
    fields: FIELD_TRANSLATABLE,
    ptValues: {
      label: data.labelPt,
      hint: data.hintPt ?? null,
      options: data.optionsPt ?? null,
    },
    submittedValues: {
      EN: { label: data.labelEn ?? null, hint: data.hintEn ?? null, options: data.optionsEn ?? null },
      ES: { label: data.labelEs ?? null, hint: data.hintEs ?? null, options: data.optionsEs ?? null },
      FR: { label: data.labelFr ?? null, hint: data.hintFr ?? null, options: data.optionsFr ?? null },
    },
    existingTranslations,
  });

  return [
    {
      locale: "PT" as const,
      isAutoTranslated: false,
      label: data.labelPt,
      hint: data.hintPt ?? null,
      options: data.optionsPt ?? null,
    },
    ...resolved.map((r) => ({
      locale: r.locale,
      isAutoTranslated: r.isAutoTranslated,
      // O rótulo é obrigatório na tabela: se a tradução falhar, fica o PT.
      label: r.fields.label || data.labelPt,
      hint: r.fields.hint,
      options: r.fields.options,
    })),
  ];
}

export async function createLpSimulatorField(_prevState: string | undefined, formData: FormData) {
  await requirePermission("landing_page", "create");
  const parsed = lpSimulatorFieldSchema.safeParse(readFieldForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { labelPt, labelEn, labelEs, labelFr, hintPt, hintEn, hintEs, hintFr,
    optionsPt, optionsEn, optionsEs, optionsFr, ...data } = parsed.data;

  if (RESERVED_FIELD_KEYS.includes(data.key)) return "Essa chave está reservada. Escolhe outra.";
  const existing = await prisma.lpSimulatorField.findUnique({ where: { key: data.key }, select: { id: true } });
  if (existing) return "Já existe um campo com essa chave.";

  const translations = await buildFieldTranslations(
    { labelPt, labelEn, labelEs, labelFr, hintPt, hintEn, hintEs, hintFr,
      optionsPt, optionsEn, optionsEs, optionsFr },
    [],
  );

  await prisma.lpSimulatorField.create({
    data: { ...data, translations: { create: translations } },
  });

  revalidateLp();
  redirect("/admin/landing-page?saved=1");
}

export async function updateLpSimulatorField(id: string, _prevState: string | undefined, formData: FormData) {
  await requirePermission("landing_page", "edit");
  const parsed = lpSimulatorFieldSchema.safeParse(readFieldForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const current = await prisma.lpSimulatorField.findUnique({
    where: { id },
    select: { key: true, type: true, isSystem: true, translations: true },
  });
  if (!current) return "Esse campo já não existe.";

  const { labelPt, labelEn, labelEs, labelFr, hintPt, hintEn, hintEs, hintFr,
    optionsPt, optionsEn, optionsEs, optionsFr, ...data } = parsed.data;

  // Num campo do sistema a chave, o tipo e o estado não se mexem: o
  // formulário mostra-os bloqueados, e um campo bloqueado não é enviado.
  const base = current.isSystem
    ? { ...data, key: current.key, type: current.type, isActive: true }
    : data;

  if (!current.isSystem) {
    if (RESERVED_FIELD_KEYS.includes(base.key)) return "Essa chave está reservada. Escolhe outra.";
    const clash = await prisma.lpSimulatorField.findUnique({ where: { key: base.key }, select: { id: true } });
    if (clash && clash.id !== id) return "Já existe outro campo com essa chave.";
  }

  const translations = await buildFieldTranslations(
    { labelPt, labelEn, labelEs, labelFr, hintPt, hintEn, hintEs, hintFr,
      optionsPt, optionsEn, optionsEs, optionsFr },
    current.translations,
  );

  await prisma.lpSimulatorField.update({
    where: { id },
    data: {
      ...base,
      translations: {
        upsert: translations.map((t) => {
          const { locale, ...fields } = t;
          return {
            where: { fieldId_locale: { fieldId: id, locale } },
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

export async function deleteLpSimulatorField(id: string) {
  await requirePermission("landing_page", "delete");
  const field = await prisma.lpSimulatorField.findUnique({ where: { id }, select: { isSystem: true } });
  // Sem nome, email, telefone ou metros quadrados não há lead contactável
  // nem estimativa para calcular — por isso estes não se apagam.
  if (!field || field.isSystem) return;
  await prisma.lpSimulatorField.delete({ where: { id } });
  revalidateLp();
}
