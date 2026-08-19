"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/permissions";
import { serviceSchema, serviceFeatureSchema } from "@/lib/validations/service";
import { sanitizeRichText } from "@/lib/sanitize-rich-text";

type ServiceTypeKey = "LSF" | "REMODELACAO";

function readServiceForm(formData: FormData) {
  return {
    imageUrl: formData.get("imageUrl") || undefined,
    ctaKey: formData.get("ctaKey") || undefined,
    isActive: formData.get("isActive") === "on",
    cardLabelPt: formData.get("cardLabelPt"),
    cardLabelEn: formData.get("cardLabelEn"),
    titlePt: formData.get("titlePt"),
    titleEn: formData.get("titleEn"),
    introPt: formData.get("introPt"),
    introEn: formData.get("introEn"),
  };
}

export async function upsertService(
  type: ServiceTypeKey,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requireEditorOrAdmin();
  const parsed = serviceSchema.safeParse(readServiceForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { cardLabelPt, cardLabelEn, titlePt, titleEn, introPt: introPtRaw, introEn: introEnRaw, ...data } = parsed.data;
  const introPt = sanitizeRichText(introPtRaw);
  const introEn = sanitizeRichText(introEnRaw);

  const service = await prisma.service.findUnique({ where: { type } });

  if (service) {
    await prisma.service.update({
      where: { type },
      data: {
        ...data,
        imageUrl: data.imageUrl || null,
        ctaKey: data.ctaKey || null,
        translations: {
          upsert: [
            {
              where: { serviceId_locale: { serviceId: service.id, locale: "PT" } },
              update: { cardLabel: cardLabelPt, title: titlePt, intro: introPt },
              create: { locale: "PT", cardLabel: cardLabelPt, title: titlePt, intro: introPt },
            },
            {
              where: { serviceId_locale: { serviceId: service.id, locale: "EN" } },
              update: { cardLabel: cardLabelEn, title: titleEn, intro: introEn },
              create: { locale: "EN", cardLabel: cardLabelEn, title: titleEn, intro: introEn },
            },
          ],
        },
      },
    });
  } else {
    await prisma.service.create({
      data: {
        type,
        ...data,
        translations: {
          create: [
            { locale: "PT", cardLabel: cardLabelPt, title: titlePt, intro: introPt },
            { locale: "EN", cardLabel: cardLabelEn, title: titleEn, intro: introEn },
          ],
        },
      },
    });
  }

  revalidatePath("/admin/services");
  revalidatePath("/");
  redirect(`/admin/services/${type}/edit?saved=1`);
}

function readFeatureForm(formData: FormData) {
  return {
    iconName: formData.get("iconName") || undefined,
    order: formData.get("order"),
    titlePt: formData.get("titlePt"),
    titleEn: formData.get("titleEn"),
    bodyPt: formData.get("bodyPt") || undefined,
    bodyEn: formData.get("bodyEn") || undefined,
  };
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

  const { titlePt, titleEn, bodyPt, bodyEn, ...data } = parsed.data;
  await prisma.serviceFeature.create({
    data: {
      ...data,
      serviceId,
      translations: {
        create: [
          { locale: "PT", title: titlePt, body: bodyPt },
          { locale: "EN", title: titleEn, body: bodyEn },
        ],
      },
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

  const { titlePt, titleEn, bodyPt, bodyEn, ...data } = parsed.data;
  await prisma.serviceFeature.update({
    where: { id: featureId },
    data: {
      ...data,
      iconName: data.iconName || null,
      translations: {
        upsert: [
          {
            where: { featureId_locale: { featureId, locale: "PT" } },
            update: { title: titlePt, body: bodyPt },
            create: { locale: "PT", title: titlePt, body: bodyPt },
          },
          {
            where: { featureId_locale: { featureId, locale: "EN" } },
            update: { title: titleEn, body: bodyEn },
            create: { locale: "EN", title: titleEn, body: bodyEn },
          },
        ],
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
