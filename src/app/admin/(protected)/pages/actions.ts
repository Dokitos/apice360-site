"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { customPageSchema } from "@/lib/validations/custom-page";
import { resolveTranslations, type ExistingTranslationRow } from "@/lib/auto-translate";

const CUSTOM_PAGE_FIELDS = [{ key: "navLabel" }, { key: "heading" }, { key: "seoTitle" }, { key: "seoDescription" }];

function readForm(formData: FormData) {
  return {
    slug: formData.get("slug"),
    order: formData.get("order"),
    showInMenu: formData.get("showInMenu") === "on",
    isPublished: formData.get("isPublished") === "on",
    navLabelPt: formData.get("navLabelPt"),
    navLabelEn: formData.get("navLabelEn"),
    navLabelEs: formData.get("navLabelEs"),
    navLabelFr: formData.get("navLabelFr"),
    headingPt: formData.get("headingPt") || undefined,
    headingEn: formData.get("headingEn") || undefined,
    headingEs: formData.get("headingEs") || undefined,
    headingFr: formData.get("headingFr") || undefined,
    seoTitlePt: formData.get("seoTitlePt") || undefined,
    seoTitleEn: formData.get("seoTitleEn") || undefined,
    seoTitleEs: formData.get("seoTitleEs") || undefined,
    seoTitleFr: formData.get("seoTitleFr") || undefined,
    seoDescriptionPt: formData.get("seoDescriptionPt") || undefined,
    seoDescriptionEn: formData.get("seoDescriptionEn") || undefined,
    seoDescriptionEs: formData.get("seoDescriptionEs") || undefined,
    seoDescriptionFr: formData.get("seoDescriptionFr") || undefined,
  };
}

async function buildCustomPageTranslations(
  data: {
    navLabelPt: string; headingPt?: string; seoTitlePt?: string; seoDescriptionPt?: string;
    navLabelEn?: string; headingEn?: string; seoTitleEn?: string; seoDescriptionEn?: string;
    navLabelEs?: string; headingEs?: string; seoTitleEs?: string; seoDescriptionEs?: string;
    navLabelFr?: string; headingFr?: string; seoTitleFr?: string; seoDescriptionFr?: string;
  },
  existingTranslations: ExistingTranslationRow[],
) {
  const resolved = await resolveTranslations({
    fields: CUSTOM_PAGE_FIELDS,
    ptValues: {
      navLabel: data.navLabelPt,
      heading: data.headingPt ?? null,
      seoTitle: data.seoTitlePt ?? null,
      seoDescription: data.seoDescriptionPt ?? null,
    },
    submittedValues: {
      EN: { navLabel: data.navLabelEn ?? null, heading: data.headingEn ?? null, seoTitle: data.seoTitleEn ?? null, seoDescription: data.seoDescriptionEn ?? null },
      ES: { navLabel: data.navLabelEs ?? null, heading: data.headingEs ?? null, seoTitle: data.seoTitleEs ?? null, seoDescription: data.seoDescriptionEs ?? null },
      FR: { navLabel: data.navLabelFr ?? null, heading: data.headingFr ?? null, seoTitle: data.seoTitleFr ?? null, seoDescription: data.seoDescriptionFr ?? null },
    },
    existingTranslations,
  });

  return [
    {
      locale: "PT" as const,
      isAutoTranslated: false,
      navLabel: data.navLabelPt,
      heading: data.headingPt ?? null,
      seoTitle: data.seoTitlePt ?? null,
      seoDescription: data.seoDescriptionPt ?? null,
    },
    ...resolved.map((r) => ({
      locale: r.locale,
      isAutoTranslated: r.isAutoTranslated,
      navLabel: r.fields.navLabel ?? "",
      heading: r.fields.heading,
      seoTitle: r.fields.seoTitle,
      seoDescription: r.fields.seoDescription,
    })),
  ];
}

export async function createCustomPage(_prevState: string | undefined, formData: FormData) {
  await requirePermission("custom_pages", "create");
  const parsed = customPageSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const {
    slug, order, showInMenu, isPublished,
    navLabelPt, navLabelEn, navLabelEs, navLabelFr,
    headingPt, headingEn, headingEs, headingFr,
    seoTitlePt, seoTitleEn, seoTitleEs, seoTitleFr,
    seoDescriptionPt, seoDescriptionEn, seoDescriptionEs, seoDescriptionFr,
  } = parsed.data;

  const existing = await prisma.customPage.findUnique({ where: { slug } });
  if (existing) return "Já existe uma página com este slug.";

  const translations = await buildCustomPageTranslations(
    { navLabelPt, navLabelEn, navLabelEs, navLabelFr, headingPt, headingEn, headingEs, headingFr, seoTitlePt, seoTitleEn, seoTitleEs, seoTitleFr, seoDescriptionPt, seoDescriptionEn, seoDescriptionEs, seoDescriptionFr },
    [],
  );

  const page = await prisma.customPage.create({
    data: {
      slug,
      order,
      showInMenu,
      isPublished,
      translations: { create: translations },
    },
  });

  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  redirect(`/admin/pages/${page.id}/edit?saved=1`);
}

export async function updateCustomPage(id: string, _prevState: string | undefined, formData: FormData) {
  await requirePermission("custom_pages", "edit");
  const parsed = customPageSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const {
    slug, order, showInMenu, isPublished,
    navLabelPt, navLabelEn, navLabelEs, navLabelFr,
    headingPt, headingEn, headingEs, headingFr,
    seoTitlePt, seoTitleEn, seoTitleEs, seoTitleFr,
    seoDescriptionPt, seoDescriptionEn, seoDescriptionEs, seoDescriptionFr,
  } = parsed.data;

  const existing = await prisma.customPage.findUnique({ where: { slug } });
  if (existing && existing.id !== id) return "Já existe outra página com este slug.";

  const translations = await buildCustomPageTranslations(
    { navLabelPt, navLabelEn, navLabelEs, navLabelFr, headingPt, headingEn, headingEs, headingFr, seoTitlePt, seoTitleEn, seoTitleEs, seoTitleFr, seoDescriptionPt, seoDescriptionEn, seoDescriptionEs, seoDescriptionFr },
    await prisma.customPageTranslation.findMany({ where: { customPageId: id } }),
  );

  await prisma.customPage.update({
    where: { id },
    data: {
      slug,
      order,
      showInMenu,
      isPublished,
      translations: {
        upsert: translations.map((t) => {
          const { locale, ...fields } = t;
          return {
            where: { customPageId_locale: { customPageId: id, locale } },
            update: fields,
            create: t,
          };
        }),
      },
    },
  });

  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
  redirect(`/admin/pages/${id}/edit?saved=1`);
}

export async function deleteCustomPage(id: string) {
  await requirePermission("custom_pages", "delete");
  await prisma.customPage.delete({ where: { id } });
  revalidatePath("/admin/pages");
  revalidatePath("/", "layout");
}
