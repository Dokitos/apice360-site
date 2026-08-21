"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { siteSettingsSchema } from "@/lib/validations/site-settings";
import { resolveTranslations, type ExistingTranslationRow } from "@/lib/auto-translate";

export type SiteSettingsFormState = { ok: boolean; message: string } | undefined;

const SETTINGS_FIELDS = [
  { key: "footerDescription" },
  { key: "showroomText" },
  { key: "defaultSeoTitle" },
  { key: "defaultSeoDescription" },
];

function readForm(formData: FormData) {
  return {
    ...Object.fromEntries(formData.entries()),
    architectAreaEnabled: formData.get("architectAreaEnabled") === "on",
    maintenanceMode: formData.get("maintenanceMode") === "on",
  };
}

export async function updateSiteSettings(
  _prevState: SiteSettingsFormState,
  formData: FormData,
): Promise<SiteSettingsFormState> {
  await requirePermission("site_settings", "edit");
  const parsed = siteSettingsSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const {
    footerDescriptionPt, footerDescriptionEn, footerDescriptionEs, footerDescriptionFr,
    showroomTextPt, showroomTextEn, showroomTextEs, showroomTextFr,
    defaultSeoTitlePt, defaultSeoTitleEn, defaultSeoTitleEs, defaultSeoTitleFr,
    defaultSeoDescriptionPt, defaultSeoDescriptionEn, defaultSeoDescriptionEs, defaultSeoDescriptionFr,
    ...data
  } = parsed.data;

  const existing = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: { translations: true },
  });
  const existingTranslations: ExistingTranslationRow[] = existing?.translations ?? [];

  const resolved = await resolveTranslations({
    fields: SETTINGS_FIELDS,
    ptValues: {
      footerDescription: footerDescriptionPt ?? null,
      showroomText: showroomTextPt ?? null,
      defaultSeoTitle: defaultSeoTitlePt ?? null,
      defaultSeoDescription: defaultSeoDescriptionPt ?? null,
    },
    submittedValues: {
      EN: { footerDescription: footerDescriptionEn ?? null, showroomText: showroomTextEn ?? null, defaultSeoTitle: defaultSeoTitleEn ?? null, defaultSeoDescription: defaultSeoDescriptionEn ?? null },
      ES: { footerDescription: footerDescriptionEs ?? null, showroomText: showroomTextEs ?? null, defaultSeoTitle: defaultSeoTitleEs ?? null, defaultSeoDescription: defaultSeoDescriptionEs ?? null },
      FR: { footerDescription: footerDescriptionFr ?? null, showroomText: showroomTextFr ?? null, defaultSeoTitle: defaultSeoTitleFr ?? null, defaultSeoDescription: defaultSeoDescriptionFr ?? null },
    },
    existingTranslations,
  });

  const translations = [
    {
      locale: "PT" as const,
      isAutoTranslated: false,
      footerDescription: footerDescriptionPt ?? null,
      showroomText: showroomTextPt ?? null,
      defaultSeoTitle: defaultSeoTitlePt ?? null,
      defaultSeoDescription: defaultSeoDescriptionPt ?? null,
    },
    ...resolved.map((r) => ({
      locale: r.locale,
      isAutoTranslated: r.isAutoTranslated,
      footerDescription: r.fields.footerDescription,
      showroomText: r.fields.showroomText,
      defaultSeoTitle: r.fields.defaultSeoTitle,
      defaultSeoDescription: r.fields.defaultSeoDescription,
    })),
  ];

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      ...data,
      translations: {
        upsert: translations.map((t) => {
          const { locale, ...fields } = t;
          return {
            where: { siteSettingsId_locale: { siteSettingsId: "singleton", locale } },
            update: fields,
            create: t,
          };
        }),
      },
    },
    create: {
      id: "singleton",
      ...data,
      translations: { create: translations },
    },
  });

  revalidatePath("/admin/site-settings");
  // "layout" so the maintenance-mode / architect-area gate in the public
  // (public)/layout.tsx re-evaluates on every page immediately, not just "/".
  revalidatePath("/", "layout");
  return { ok: true, message: "Definições guardadas com sucesso." };
}
