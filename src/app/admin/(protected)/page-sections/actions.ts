"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { pageSectionSchema, pageSectionItemSchema } from "@/lib/validations/page-section";
import { sanitizeRichText } from "@/lib/sanitize-rich-text";
import { resolveTranslations, type ExistingTranslationRow } from "@/lib/auto-translate";

type PageKeyValue =
  | "HOME"
  | "QUEM_SOMOS"
  | "SERVICOS"
  | "PORTFOLIO"
  | "BLOG"
  | "CONTACTO"
  | "AREA_ARQUITETO";

const SECTION_FIELDS = [
  { key: "eyebrow" },
  { key: "heading" },
  { key: "subheading" },
  { key: "body", isHtml: true },
  { key: "ctaLabel" },
];

function readSectionForm(formData: FormData) {
  return {
    key: formData.get("key"),
    layout: formData.get("layout") || "standard",
    imageUrl: formData.get("imageUrl") || undefined,
    iconName: formData.get("iconName") || undefined,
    ctaKey: formData.get("ctaKey") || undefined,
    order: formData.get("order"),
    isActive: formData.get("isActive") === "on",
    eyebrowPt: formData.get("eyebrowPt") || undefined,
    eyebrowEn: formData.get("eyebrowEn") || undefined,
    eyebrowEs: formData.get("eyebrowEs") || undefined,
    eyebrowFr: formData.get("eyebrowFr") || undefined,
    headingPt: formData.get("headingPt") || undefined,
    headingEn: formData.get("headingEn") || undefined,
    headingEs: formData.get("headingEs") || undefined,
    headingFr: formData.get("headingFr") || undefined,
    subheadingPt: formData.get("subheadingPt") || undefined,
    subheadingEn: formData.get("subheadingEn") || undefined,
    subheadingEs: formData.get("subheadingEs") || undefined,
    subheadingFr: formData.get("subheadingFr") || undefined,
    bodyPt: formData.get("bodyPt") || undefined,
    bodyEn: formData.get("bodyEn") || undefined,
    bodyEs: formData.get("bodyEs") || undefined,
    bodyFr: formData.get("bodyFr") || undefined,
    ctaLabelPt: formData.get("ctaLabelPt") || undefined,
    ctaLabelEn: formData.get("ctaLabelEn") || undefined,
    ctaLabelEs: formData.get("ctaLabelEs") || undefined,
    ctaLabelFr: formData.get("ctaLabelFr") || undefined,
  };
}

async function buildSectionTranslations(
  data: {
    eyebrowPt?: string; eyebrowEn?: string; eyebrowEs?: string; eyebrowFr?: string;
    headingPt?: string; headingEn?: string; headingEs?: string; headingFr?: string;
    subheadingPt?: string; subheadingEn?: string; subheadingEs?: string; subheadingFr?: string;
    bodyPt?: string; bodyEn?: string; bodyEs?: string; bodyFr?: string;
    ctaLabelPt?: string; ctaLabelEn?: string; ctaLabelEs?: string; ctaLabelFr?: string;
  },
  existingTranslations: ExistingTranslationRow[],
) {
  const ptBody = data.bodyPt ? sanitizeRichText(data.bodyPt) : data.bodyPt;

  const resolved = await resolveTranslations({
    fields: SECTION_FIELDS,
    ptValues: { eyebrow: data.eyebrowPt ?? null, heading: data.headingPt ?? null, subheading: data.subheadingPt ?? null, body: ptBody ?? null, ctaLabel: data.ctaLabelPt ?? null },
    submittedValues: {
      EN: { eyebrow: data.eyebrowEn ?? null, heading: data.headingEn ?? null, subheading: data.subheadingEn ?? null, body: data.bodyEn ?? null, ctaLabel: data.ctaLabelEn ?? null },
      ES: { eyebrow: data.eyebrowEs ?? null, heading: data.headingEs ?? null, subheading: data.subheadingEs ?? null, body: data.bodyEs ?? null, ctaLabel: data.ctaLabelEs ?? null },
      FR: { eyebrow: data.eyebrowFr ?? null, heading: data.headingFr ?? null, subheading: data.subheadingFr ?? null, body: data.bodyFr ?? null, ctaLabel: data.ctaLabelFr ?? null },
    },
    existingTranslations,
  });

  return [
    {
      locale: "PT" as const,
      isAutoTranslated: false,
      eyebrow: data.eyebrowPt ?? null,
      heading: data.headingPt ?? null,
      subheading: data.subheadingPt ?? null,
      body: ptBody ?? null,
      ctaLabel: data.ctaLabelPt ?? null,
    },
    ...resolved.map((r) => ({
      locale: r.locale,
      isAutoTranslated: r.isAutoTranslated,
      eyebrow: r.fields.eyebrow,
      heading: r.fields.heading,
      subheading: r.fields.subheading,
      body: r.fields.body ? sanitizeRichText(r.fields.body) : r.fields.body,
      ctaLabel: r.fields.ctaLabel,
    })),
  ];
}

export async function createPageSection(
  page: PageKeyValue,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requirePermission("page_sections", "create");
  const parsed = pageSectionSchema.safeParse(readSectionForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const {
    eyebrowPt, eyebrowEn, eyebrowEs, eyebrowFr,
    headingPt, headingEn, headingEs, headingFr,
    subheadingPt, subheadingEn, subheadingEs, subheadingFr,
    bodyPt, bodyEn, bodyEs, bodyFr,
    ctaLabelPt, ctaLabelEn, ctaLabelEs, ctaLabelFr,
    ...data
  } = parsed.data;

  const existing = await prisma.pageSection.findUnique({ where: { page_key: { page, key: data.key } } });
  if (existing) return "Já existe uma secção com esta chave nesta página.";

  const translations = await buildSectionTranslations(
    { eyebrowPt, eyebrowEn, eyebrowEs, eyebrowFr, headingPt, headingEn, headingEs, headingFr, subheadingPt, subheadingEn, subheadingEs, subheadingFr, bodyPt, bodyEn, bodyEs, bodyFr, ctaLabelPt, ctaLabelEn, ctaLabelEs, ctaLabelFr },
    [],
  );

  const section = await prisma.pageSection.create({
    data: {
      page,
      ...data,
      translations: { create: translations },
    },
  });

  revalidatePath(`/admin/page-sections/${page}`);
  revalidatePath("/");
  redirect(`/admin/page-sections/${page}?open=${section.id}&saved=1`);
}

export async function updatePageSection(
  page: PageKeyValue,
  id: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requirePermission("page_sections", "edit");
  const parsed = pageSectionSchema.safeParse(readSectionForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const {
    eyebrowPt, eyebrowEn, eyebrowEs, eyebrowFr,
    headingPt, headingEn, headingEs, headingFr,
    subheadingPt, subheadingEn, subheadingEs, subheadingFr,
    bodyPt, bodyEn, bodyEs, bodyFr,
    ctaLabelPt, ctaLabelEn, ctaLabelEs, ctaLabelFr,
    ...data
  } = parsed.data;

  const existing = await prisma.pageSection.findUnique({ where: { page_key: { page, key: data.key } } });
  if (existing && existing.id !== id) return "Já existe outra secção com esta chave nesta página.";

  const current = await prisma.pageSection.findUnique({ where: { id }, select: { translations: true } });
  const translations = await buildSectionTranslations(
    { eyebrowPt, eyebrowEn, eyebrowEs, eyebrowFr, headingPt, headingEn, headingEs, headingFr, subheadingPt, subheadingEn, subheadingEs, subheadingFr, bodyPt, bodyEn, bodyEs, bodyFr, ctaLabelPt, ctaLabelEn, ctaLabelEs, ctaLabelFr },
    current?.translations ?? [],
  );

  await prisma.pageSection.update({
    where: { id },
    data: {
      ...data,
      // Cleared via the picker → comes through as `undefined`, which
      // Prisma treats as "don't touch this field" and would silently keep
      // the old value. Coerce to null so clearing actually persists.
      imageUrl: data.imageUrl || null,
      iconName: data.iconName || null,
      ctaKey: data.ctaKey || null,
      translations: {
        upsert: translations.map((t) => {
          const { locale, ...fields } = t;
          return {
            where: { sectionId_locale: { sectionId: id, locale } },
            update: fields,
            create: t,
          };
        }),
      },
    },
  });

  revalidatePath(`/admin/page-sections/${page}`);
  revalidatePath("/");
  redirect(`/admin/page-sections/${page}?open=${id}&saved=1`);
}

export async function deletePageSection(page: PageKeyValue, id: string) {
  await requirePermission("page_sections", "delete");
  await prisma.pageSection.delete({ where: { id } });
  revalidatePath(`/admin/page-sections/${page}`);
  revalidatePath("/");
}

export async function reorderPageSections(page: PageKeyValue, orderedIds: string[]) {
  await requirePermission("page_sections", "edit");
  await prisma.$transaction(
    orderedIds.map((id, order) => prisma.pageSection.update({ where: { id }, data: { order } })),
  );
  revalidatePath(`/admin/page-sections/${page}`);
  revalidatePath("/");
}

export async function reorderPageSectionItems(page: PageKeyValue, sectionId: string, orderedIds: string[]) {
  await requirePermission("page_sections", "edit");
  await prisma.$transaction(
    orderedIds.map((id, order) => prisma.pageSectionItem.update({ where: { id }, data: { order } })),
  );
  revalidatePath(`/admin/page-sections/${page}`);
  revalidatePath("/");
}

const ITEM_FIELDS = [{ key: "title" }, { key: "body" }];

function readItemForm(formData: FormData) {
  return {
    iconName: formData.get("iconName") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
    numberLabel: formData.get("numberLabel") || undefined,
    ctaKey: formData.get("ctaKey") || undefined,
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

async function buildItemTranslations(
  data: {
    titlePt: string; titleEn?: string; titleEs?: string; titleFr?: string;
    bodyPt?: string; bodyEn?: string; bodyEs?: string; bodyFr?: string;
  },
  existingTranslations: ExistingTranslationRow[],
) {
  const resolved = await resolveTranslations({
    fields: ITEM_FIELDS,
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

export async function createPageSectionItem(
  page: PageKeyValue,
  sectionId: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requirePermission("page_sections", "create");
  const parsed = pageSectionItemSchema.safeParse(readItemForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { titlePt, titleEn, titleEs, titleFr, bodyPt, bodyEn, bodyEs, bodyFr, ...data } = parsed.data;
  const translations = await buildItemTranslations({ titlePt, titleEn, titleEs, titleFr, bodyPt, bodyEn, bodyEs, bodyFr }, []);

  await prisma.pageSectionItem.create({
    data: {
      ...data,
      iconName: data.iconName || null,
      imageUrl: data.imageUrl || null,
      numberLabel: data.numberLabel || null,
      ctaKey: data.ctaKey || null,
      sectionId,
      translations: { create: translations },
    },
  });
  revalidatePath(`/admin/page-sections/${page}`);
  revalidatePath("/");
  redirect(`/admin/page-sections/${page}?open=${sectionId}&saved=1`);
}

export async function updatePageSectionItem(
  page: PageKeyValue,
  sectionId: string,
  itemId: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requirePermission("page_sections", "edit");
  const parsed = pageSectionItemSchema.safeParse(readItemForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { titlePt, titleEn, titleEs, titleFr, bodyPt, bodyEn, bodyEs, bodyFr, ...data } = parsed.data;

  const current = await prisma.pageSectionItem.findUnique({ where: { id: itemId }, select: { translations: true } });
  const translations = await buildItemTranslations(
    { titlePt, titleEn, titleEs, titleFr, bodyPt, bodyEn, bodyEs, bodyFr },
    current?.translations ?? [],
  );

  await prisma.pageSectionItem.update({
    where: { id: itemId },
    data: {
      ...data,
      iconName: data.iconName || null,
      imageUrl: data.imageUrl || null,
      numberLabel: data.numberLabel || null,
      ctaKey: data.ctaKey || null,
      translations: {
        upsert: translations.map((t) => {
          const { locale, ...fields } = t;
          return {
            where: { itemId_locale: { itemId, locale } },
            update: fields,
            create: t,
          };
        }),
      },
    },
  });
  revalidatePath(`/admin/page-sections/${page}`);
  revalidatePath("/");
  redirect(`/admin/page-sections/${page}?open=${sectionId}&saved=1`);
}

export async function deletePageSectionItem(page: PageKeyValue, sectionId: string, itemId: string) {
  await requirePermission("page_sections", "delete");
  await prisma.pageSectionItem.delete({ where: { id: itemId } });
  revalidatePath(`/admin/page-sections/${page}`);
  revalidatePath("/");
}

// Custom pages (src/app/admin/(protected)/pages) reuse the exact same
// section/item building blocks above — only the "owner" reference
// (customPageId instead of a fixed PageKeyValue) and the resulting
// admin/public paths differ.

export async function createCustomPageSection(
  customPageId: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requirePermission("custom_pages", "create");
  const parsed = pageSectionSchema.safeParse(readSectionForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const {
    eyebrowPt, eyebrowEn, eyebrowEs, eyebrowFr,
    headingPt, headingEn, headingEs, headingFr,
    subheadingPt, subheadingEn, subheadingEs, subheadingFr,
    bodyPt, bodyEn, bodyEs, bodyFr,
    ctaLabelPt, ctaLabelEn, ctaLabelEs, ctaLabelFr,
    ...data
  } = parsed.data;

  const existing = await prisma.pageSection.findUnique({ where: { customPageId_key: { customPageId, key: data.key } } });
  if (existing) return "Já existe uma secção com esta chave nesta página.";

  const translations = await buildSectionTranslations(
    { eyebrowPt, eyebrowEn, eyebrowEs, eyebrowFr, headingPt, headingEn, headingEs, headingFr, subheadingPt, subheadingEn, subheadingEs, subheadingFr, bodyPt, bodyEn, bodyEs, bodyFr, ctaLabelPt, ctaLabelEn, ctaLabelEs, ctaLabelFr },
    [],
  );

  const section = await prisma.pageSection.create({
    data: {
      customPageId,
      ...data,
      translations: { create: translations },
    },
  });

  revalidatePath(`/admin/pages/${customPageId}/edit`);
  revalidatePath("/", "layout");
  redirect(`/admin/pages/${customPageId}/edit?open=${section.id}&saved=1`);
}

export async function updateCustomPageSection(
  customPageId: string,
  id: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requirePermission("custom_pages", "edit");
  const parsed = pageSectionSchema.safeParse(readSectionForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const {
    eyebrowPt, eyebrowEn, eyebrowEs, eyebrowFr,
    headingPt, headingEn, headingEs, headingFr,
    subheadingPt, subheadingEn, subheadingEs, subheadingFr,
    bodyPt, bodyEn, bodyEs, bodyFr,
    ctaLabelPt, ctaLabelEn, ctaLabelEs, ctaLabelFr,
    ...data
  } = parsed.data;

  const existing = await prisma.pageSection.findUnique({ where: { customPageId_key: { customPageId, key: data.key } } });
  if (existing && existing.id !== id) return "Já existe outra secção com esta chave nesta página.";

  const current = await prisma.pageSection.findUnique({ where: { id }, select: { translations: true } });
  const translations = await buildSectionTranslations(
    { eyebrowPt, eyebrowEn, eyebrowEs, eyebrowFr, headingPt, headingEn, headingEs, headingFr, subheadingPt, subheadingEn, subheadingEs, subheadingFr, bodyPt, bodyEn, bodyEs, bodyFr, ctaLabelPt, ctaLabelEn, ctaLabelEs, ctaLabelFr },
    current?.translations ?? [],
  );

  await prisma.pageSection.update({
    where: { id },
    data: {
      ...data,
      imageUrl: data.imageUrl || null,
      iconName: data.iconName || null,
      ctaKey: data.ctaKey || null,
      translations: {
        upsert: translations.map((t) => {
          const { locale, ...fields } = t;
          return {
            where: { sectionId_locale: { sectionId: id, locale } },
            update: fields,
            create: t,
          };
        }),
      },
    },
  });

  revalidatePath(`/admin/pages/${customPageId}/edit`);
  revalidatePath("/", "layout");
  redirect(`/admin/pages/${customPageId}/edit?open=${id}&saved=1`);
}

export async function deleteCustomPageSection(customPageId: string, id: string) {
  await requirePermission("custom_pages", "delete");
  await prisma.pageSection.delete({ where: { id } });
  revalidatePath(`/admin/pages/${customPageId}/edit`);
  revalidatePath("/", "layout");
}

export async function reorderCustomPageSections(customPageId: string, orderedIds: string[]) {
  await requirePermission("custom_pages", "edit");
  await prisma.$transaction(
    orderedIds.map((id, order) => prisma.pageSection.update({ where: { id }, data: { order } })),
  );
  revalidatePath(`/admin/pages/${customPageId}/edit`);
  revalidatePath("/", "layout");
}

export async function reorderCustomPageSectionItems(customPageId: string, sectionId: string, orderedIds: string[]) {
  await requirePermission("custom_pages", "edit");
  await prisma.$transaction(
    orderedIds.map((id, order) => prisma.pageSectionItem.update({ where: { id }, data: { order } })),
  );
  revalidatePath(`/admin/pages/${customPageId}/edit`);
  revalidatePath("/", "layout");
}

export async function createCustomPageSectionItem(
  customPageId: string,
  sectionId: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requirePermission("custom_pages", "create");
  const parsed = pageSectionItemSchema.safeParse(readItemForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { titlePt, titleEn, titleEs, titleFr, bodyPt, bodyEn, bodyEs, bodyFr, ...data } = parsed.data;
  const translations = await buildItemTranslations({ titlePt, titleEn, titleEs, titleFr, bodyPt, bodyEn, bodyEs, bodyFr }, []);

  await prisma.pageSectionItem.create({
    data: {
      ...data,
      iconName: data.iconName || null,
      imageUrl: data.imageUrl || null,
      numberLabel: data.numberLabel || null,
      ctaKey: data.ctaKey || null,
      sectionId,
      translations: { create: translations },
    },
  });
  revalidatePath(`/admin/pages/${customPageId}/edit`);
  revalidatePath("/", "layout");
  redirect(`/admin/pages/${customPageId}/edit?open=${sectionId}&saved=1`);
}

export async function updateCustomPageSectionItem(
  customPageId: string,
  sectionId: string,
  itemId: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requirePermission("custom_pages", "edit");
  const parsed = pageSectionItemSchema.safeParse(readItemForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { titlePt, titleEn, titleEs, titleFr, bodyPt, bodyEn, bodyEs, bodyFr, ...data } = parsed.data;

  const current = await prisma.pageSectionItem.findUnique({ where: { id: itemId }, select: { translations: true } });
  const translations = await buildItemTranslations(
    { titlePt, titleEn, titleEs, titleFr, bodyPt, bodyEn, bodyEs, bodyFr },
    current?.translations ?? [],
  );

  await prisma.pageSectionItem.update({
    where: { id: itemId },
    data: {
      ...data,
      iconName: data.iconName || null,
      imageUrl: data.imageUrl || null,
      numberLabel: data.numberLabel || null,
      ctaKey: data.ctaKey || null,
      translations: {
        upsert: translations.map((t) => {
          const { locale, ...fields } = t;
          return {
            where: { itemId_locale: { itemId, locale } },
            update: fields,
            create: t,
          };
        }),
      },
    },
  });
  revalidatePath(`/admin/pages/${customPageId}/edit`);
  revalidatePath("/", "layout");
  redirect(`/admin/pages/${customPageId}/edit?open=${sectionId}&saved=1`);
}

export async function deleteCustomPageSectionItem(customPageId: string, sectionId: string, itemId: string) {
  await requirePermission("custom_pages", "delete");
  await prisma.pageSectionItem.delete({ where: { id: itemId } });
  revalidatePath(`/admin/pages/${customPageId}/edit`);
  revalidatePath("/", "layout");
}
