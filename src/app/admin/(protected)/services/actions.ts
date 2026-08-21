"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/permissions";
import { serviceSchema, serviceFeatureSchema } from "@/lib/validations/service";
import { sanitizeRichText } from "@/lib/sanitize-rich-text";
import { resolveTranslations, type ExistingTranslationRow } from "@/lib/auto-translate";

type ServiceTypeKey = "LSF" | "REMODELACAO";

const SERVICE_FIELDS = [{ key: "cardLabel" }, { key: "title" }, { key: "intro", isHtml: true }];

function readServiceForm(formData: FormData) {
  return {
    imageUrl: formData.get("imageUrl") || undefined,
    ctaKey: formData.get("ctaKey") || undefined,
    isActive: formData.get("isActive") === "on",
    cardLabelPt: formData.get("cardLabelPt"),
    cardLabelEn: formData.get("cardLabelEn"),
    cardLabelEs: formData.get("cardLabelEs"),
    cardLabelFr: formData.get("cardLabelFr"),
    titlePt: formData.get("titlePt"),
    titleEn: formData.get("titleEn"),
    titleEs: formData.get("titleEs"),
    titleFr: formData.get("titleFr"),
    introPt: formData.get("introPt"),
    introEn: formData.get("introEn"),
    introEs: formData.get("introEs"),
    introFr: formData.get("introFr"),
  };
}

async function buildServiceTranslations(
  data: {
    cardLabelPt: string; cardLabelEn?: string; cardLabelEs?: string; cardLabelFr?: string;
    titlePt: string; titleEn?: string; titleEs?: string; titleFr?: string;
    introPt: string; introEn?: string; introEs?: string; introFr?: string;
  },
  existingTranslations: ExistingTranslationRow[],
) {
  const ptIntro = sanitizeRichText(data.introPt);

  const resolved = await resolveTranslations({
    fields: SERVICE_FIELDS,
    ptValues: { cardLabel: data.cardLabelPt, title: data.titlePt, intro: ptIntro },
    submittedValues: {
      EN: { cardLabel: data.cardLabelEn ?? null, title: data.titleEn ?? null, intro: data.introEn ?? null },
      ES: { cardLabel: data.cardLabelEs ?? null, title: data.titleEs ?? null, intro: data.introEs ?? null },
      FR: { cardLabel: data.cardLabelFr ?? null, title: data.titleFr ?? null, intro: data.introFr ?? null },
    },
    existingTranslations,
  });

  return [
    { locale: "PT" as const, isAutoTranslated: false, cardLabel: data.cardLabelPt, title: data.titlePt, intro: ptIntro },
    ...resolved.map((r) => ({
      locale: r.locale,
      isAutoTranslated: r.isAutoTranslated,
      cardLabel: r.fields.cardLabel ?? "",
      title: r.fields.title ?? "",
      intro: r.fields.intro ? sanitizeRichText(r.fields.intro) : (r.fields.intro ?? ""),
    })),
  ];
}

export async function upsertService(
  type: ServiceTypeKey,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requireEditorOrAdmin();
  const parsed = serviceSchema.safeParse(readServiceForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const {
    cardLabelPt, cardLabelEn, cardLabelEs, cardLabelFr,
    titlePt, titleEn, titleEs, titleFr,
    introPt, introEn, introEs, introFr,
    ...data
  } = parsed.data;

  const service = await prisma.service.findUnique({ where: { type } });
  const translations = await buildServiceTranslations(
    { cardLabelPt, cardLabelEn, cardLabelEs, cardLabelFr, titlePt, titleEn, titleEs, titleFr, introPt, introEn, introEs, introFr },
    service?.id ? (await prisma.serviceTranslation.findMany({ where: { serviceId: service.id } })) : [],
  );

  if (service) {
    await prisma.service.update({
      where: { type },
      data: {
        ...data,
        imageUrl: data.imageUrl || null,
        ctaKey: data.ctaKey || null,
        translations: {
          upsert: translations.map((t) => {
            const { locale, ...fields } = t;
            return {
              where: { serviceId_locale: { serviceId: service.id, locale } },
              update: fields,
              create: t,
            };
          }),
        },
      },
    });
  } else {
    await prisma.service.create({
      data: {
        type,
        ...data,
        translations: { create: translations },
      },
    });
  }

  revalidatePath("/admin/services");
  revalidatePath("/");
  redirect(`/admin/services/${type}/edit?saved=1`);
}

const FEATURE_FIELDS = [{ key: "title" }, { key: "body" }];

function readFeatureForm(formData: FormData) {
  return {
    iconName: formData.get("iconName") || undefined,
    order: formData.get("order"),
    titlePt: formData.get("titlePt"),
    titleEn: formData.get("titleEn"),
    titleEs: formData.get("titleEs"),
    titleFr: formData.get("titleFr"),
    bodyPt: formData.get("bodyPt") || undefined,
    bodyEn: formData.get("bodyEn") || undefined,
    bodyEs: formData.get("bodyEs") || undefined,
    bodyFr: formData.get("bodyFr") || undefined,
  };
}

async function buildFeatureTranslations(
  data: {
    titlePt: string; titleEn?: string; titleEs?: string; titleFr?: string;
    bodyPt?: string; bodyEn?: string; bodyEs?: string; bodyFr?: string;
  },
  existingTranslations: ExistingTranslationRow[],
) {
  const resolved = await resolveTranslations({
    fields: FEATURE_FIELDS,
    ptValues: { title: data.titlePt, body: data.bodyPt ?? null },
    submittedValues: {
      EN: { title: data.titleEn ?? null, body: data.bodyEn ?? null },
      ES: { title: data.titleEs ?? null, body: data.bodyEs ?? null },
      FR: { title: data.titleFr ?? null, body: data.bodyFr ?? null },
    },
    existingTranslations,
  });

  return [
    { locale: "PT" as const, isAutoTranslated: false, title: data.titlePt, body: data.bodyPt ?? null },
    ...resolved.map((r) => ({
      locale: r.locale,
      isAutoTranslated: r.isAutoTranslated,
      title: r.fields.title ?? "",
      body: r.fields.body,
    })),
  ];
}

export async function createServiceFeature(
  type: ServiceTypeKey,
  serviceId: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requireEditorOrAdmin();
  const parsed = serviceFeatureSchema.safeParse(readFeatureForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { titlePt, titleEn, titleEs, titleFr, bodyPt, bodyEn, bodyEs, bodyFr, ...data } = parsed.data;
  const translations = await buildFeatureTranslations({ titlePt, titleEn, titleEs, titleFr, bodyPt, bodyEn, bodyEs, bodyFr }, []);

  await prisma.serviceFeature.create({
    data: {
      ...data,
      serviceId,
      translations: { create: translations },
    },
  });
  revalidatePath(`/admin/services/${type}/edit`);
  revalidatePath("/");
  redirect(`/admin/services/${type}/edit?saved=1`);
}

export async function updateServiceFeature(
  type: ServiceTypeKey,
  featureId: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requireEditorOrAdmin();
  const parsed = serviceFeatureSchema.safeParse(readFeatureForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { titlePt, titleEn, titleEs, titleFr, bodyPt, bodyEn, bodyEs, bodyFr, ...data } = parsed.data;
  const current = await prisma.serviceFeature.findUnique({ where: { id: featureId }, select: { translations: true } });
  const translations = await buildFeatureTranslations(
    { titlePt, titleEn, titleEs, titleFr, bodyPt, bodyEn, bodyEs, bodyFr },
    current?.translations ?? [],
  );

  await prisma.serviceFeature.update({
    where: { id: featureId },
    data: {
      ...data,
      iconName: data.iconName || null,
      translations: {
        upsert: translations.map((t) => {
          const { locale, ...fields } = t;
          return {
            where: { featureId_locale: { featureId, locale } },
            update: fields,
            create: t,
          };
        }),
      },
    },
  });
  revalidatePath(`/admin/services/${type}/edit`);
  revalidatePath("/");
  redirect(`/admin/services/${type}/edit?saved=1`);
}

export async function deleteServiceFeature(type: ServiceTypeKey, featureId: string) {
  await requireEditorOrAdmin();
  await prisma.serviceFeature.delete({ where: { id: featureId } });
  revalidatePath(`/admin/services/${type}/edit`);
  revalidatePath("/");
}
