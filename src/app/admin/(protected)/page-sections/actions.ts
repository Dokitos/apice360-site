"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/permissions";
import { pageSectionSchema, pageSectionItemSchema } from "@/lib/validations/page-section";

type PageKeyValue =
  | "HOME"
  | "QUEM_SOMOS"
  | "SERVICOS"
  | "PORTFOLIO"
  | "BLOG"
  | "CONTACTO"
  | "AREA_ARQUITETO";

function readSectionForm(formData: FormData) {
  return {
    key: formData.get("key"),
    imageUrl: formData.get("imageUrl") || undefined,
    iconName: formData.get("iconName") || undefined,
    order: formData.get("order"),
    isActive: formData.get("isActive") === "on",
    eyebrowPt: formData.get("eyebrowPt") || undefined,
    eyebrowEn: formData.get("eyebrowEn") || undefined,
    headingPt: formData.get("headingPt") || undefined,
    headingEn: formData.get("headingEn") || undefined,
    subheadingPt: formData.get("subheadingPt") || undefined,
    subheadingEn: formData.get("subheadingEn") || undefined,
    bodyPt: formData.get("bodyPt") || undefined,
    bodyEn: formData.get("bodyEn") || undefined,
    ctaLabelPt: formData.get("ctaLabelPt") || undefined,
    ctaLabelEn: formData.get("ctaLabelEn") || undefined,
  };
}

export async function createPageSection(
  page: PageKeyValue,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requireEditorOrAdmin();
  const parsed = pageSectionSchema.safeParse(readSectionForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const {
    eyebrowPt,
    eyebrowEn,
    headingPt,
    headingEn,
    subheadingPt,
    subheadingEn,
    bodyPt,
    bodyEn,
    ctaLabelPt,
    ctaLabelEn,
    ...data
  } = parsed.data;

  const existing = await prisma.pageSection.findUnique({ where: { page_key: { page, key: data.key } } });
  if (existing) return "Já existe uma secção com esta chave nesta página.";

  const section = await prisma.pageSection.create({
    data: {
      page,
      ...data,
      translations: {
        create: [
          {
            locale: "PT",
            eyebrow: eyebrowPt,
            heading: headingPt,
            subheading: subheadingPt,
            body: bodyPt,
            ctaLabel: ctaLabelPt,
          },
          {
            locale: "EN",
            eyebrow: eyebrowEn,
            heading: headingEn,
            subheading: subheadingEn,
            body: bodyEn,
            ctaLabel: ctaLabelEn,
          },
        ],
      },
    },
  });

  revalidatePath(`/admin/page-sections/${page}`);
  revalidatePath("/");
  redirect(`/admin/page-sections/${page}/${section.id}/edit?saved=1`);
}

export async function updatePageSection(
  page: PageKeyValue,
  id: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requireEditorOrAdmin();
  const parsed = pageSectionSchema.safeParse(readSectionForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const {
    eyebrowPt,
    eyebrowEn,
    headingPt,
    headingEn,
    subheadingPt,
    subheadingEn,
    bodyPt,
    bodyEn,
    ctaLabelPt,
    ctaLabelEn,
    ...data
  } = parsed.data;

  const existing = await prisma.pageSection.findUnique({ where: { page_key: { page, key: data.key } } });
  if (existing && existing.id !== id) return "Já existe outra secção com esta chave nesta página.";

  await prisma.pageSection.update({
    where: { id },
    data: {
      ...data,
      translations: {
        upsert: [
          {
            where: { sectionId_locale: { sectionId: id, locale: "PT" } },
            update: { eyebrow: eyebrowPt, heading: headingPt, subheading: subheadingPt, body: bodyPt, ctaLabel: ctaLabelPt },
            create: { locale: "PT", eyebrow: eyebrowPt, heading: headingPt, subheading: subheadingPt, body: bodyPt, ctaLabel: ctaLabelPt },
          },
          {
            where: { sectionId_locale: { sectionId: id, locale: "EN" } },
            update: { eyebrow: eyebrowEn, heading: headingEn, subheading: subheadingEn, body: bodyEn, ctaLabel: ctaLabelEn },
            create: { locale: "EN", eyebrow: eyebrowEn, heading: headingEn, subheading: subheadingEn, body: bodyEn, ctaLabel: ctaLabelEn },
          },
        ],
      },
    },
  });

  revalidatePath(`/admin/page-sections/${page}`);
  revalidatePath("/");
  redirect(`/admin/page-sections/${page}/${id}/edit?saved=1`);
}

export async function deletePageSection(page: PageKeyValue, id: string) {
  await requireEditorOrAdmin();
  await prisma.pageSection.delete({ where: { id } });
  revalidatePath(`/admin/page-sections/${page}`);
  revalidatePath("/");
}

function readItemForm(formData: FormData) {
  return {
    iconName: formData.get("iconName") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    numberLabel: formData.get("numberLabel") || undefined,
    order: formData.get("order"),
    titlePt: formData.get("titlePt"),
    titleEn: formData.get("titleEn"),
    bodyPt: formData.get("bodyPt") || undefined,
    bodyEn: formData.get("bodyEn") || undefined,
  };
}

export async function createPageSectionItem(
  page: PageKeyValue,
  sectionId: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requireEditorOrAdmin();
  const parsed = pageSectionItemSchema.safeParse(readItemForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { titlePt, titleEn, bodyPt, bodyEn, ...data } = parsed.data;
  await prisma.pageSectionItem.create({
    data: {
      ...data,
      sectionId,
      translations: {
        create: [
          { locale: "PT", title: titlePt, body: bodyPt },
          { locale: "EN", title: titleEn, body: bodyEn },
        ],
      },
    },
  });
  revalidatePath(`/admin/page-sections/${page}/${sectionId}/edit`);
  revalidatePath("/");
  redirect(`/admin/page-sections/${page}/${sectionId}/edit?saved=1`);
}

export async function updatePageSectionItem(
  page: PageKeyValue,
  sectionId: string,
  itemId: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requireEditorOrAdmin();
  const parsed = pageSectionItemSchema.safeParse(readItemForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { titlePt, titleEn, bodyPt, bodyEn, ...data } = parsed.data;
  await prisma.pageSectionItem.update({
    where: { id: itemId },
    data: {
      ...data,
      translations: {
        upsert: [
          {
            where: { itemId_locale: { itemId, locale: "PT" } },
            update: { title: titlePt, body: bodyPt },
            create: { locale: "PT", title: titlePt, body: bodyPt },
          },
          {
            where: { itemId_locale: { itemId, locale: "EN" } },
            update: { title: titleEn, body: bodyEn },
            create: { locale: "EN", title: titleEn, body: bodyEn },
          },
        ],
      },
    },
  });
  revalidatePath(`/admin/page-sections/${page}/${sectionId}/edit`);
  revalidatePath("/");
  redirect(`/admin/page-sections/${page}/${sectionId}/edit?saved=1`);
}

export async function deletePageSectionItem(page: PageKeyValue, sectionId: string, itemId: string) {
  await requireEditorOrAdmin();
  await prisma.pageSectionItem.delete({ where: { id: itemId } });
  revalidatePath(`/admin/page-sections/${page}/${sectionId}/edit`);
  revalidatePath("/");
}
