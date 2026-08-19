"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/permissions";
import { siteSettingsSchema } from "@/lib/validations/site-settings";

export type SiteSettingsFormState = { ok: boolean; message: string } | undefined;

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
  await requireEditorOrAdmin();
  const parsed = siteSettingsSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const {
    footerDescriptionPt,
    footerDescriptionEn,
    showroomTextPt,
    showroomTextEn,
    defaultSeoTitlePt,
    defaultSeoTitleEn,
    defaultSeoDescriptionPt,
    defaultSeoDescriptionEn,
    ...data
  } = parsed.data;

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      ...data,
      translations: {
        upsert: [
          {
            where: { siteSettingsId_locale: { siteSettingsId: "singleton", locale: "PT" } },
            update: {
              footerDescription: footerDescriptionPt,
              showroomText: showroomTextPt,
              defaultSeoTitle: defaultSeoTitlePt,
              defaultSeoDescription: defaultSeoDescriptionPt,
            },
            create: {
              locale: "PT",
              footerDescription: footerDescriptionPt,
              showroomText: showroomTextPt,
              defaultSeoTitle: defaultSeoTitlePt,
              defaultSeoDescription: defaultSeoDescriptionPt,
            },
          },
          {
            where: { siteSettingsId_locale: { siteSettingsId: "singleton", locale: "EN" } },
            update: {
              footerDescription: footerDescriptionEn,
              showroomText: showroomTextEn,
              defaultSeoTitle: defaultSeoTitleEn,
              defaultSeoDescription: defaultSeoDescriptionEn,
            },
            create: {
              locale: "EN",
              footerDescription: footerDescriptionEn,
              showroomText: showroomTextEn,
              defaultSeoTitle: defaultSeoTitleEn,
              defaultSeoDescription: defaultSeoDescriptionEn,
            },
          },
        ],
      },
    },
    create: {
      id: "singleton",
      ...data,
      translations: {
        create: [
          {
            locale: "PT",
            footerDescription: footerDescriptionPt,
            showroomText: showroomTextPt,
            defaultSeoTitle: defaultSeoTitlePt,
            defaultSeoDescription: defaultSeoDescriptionPt,
          },
          {
            locale: "EN",
            footerDescription: footerDescriptionEn,
            showroomText: showroomTextEn,
            defaultSeoTitle: defaultSeoTitleEn,
            defaultSeoDescription: defaultSeoDescriptionEn,
          },
        ],
      },
    },
  });

  revalidatePath("/admin/site-settings");
  // "layout" so the maintenance-mode / architect-area gate in the public
  // (public)/layout.tsx re-evaluates on every page immediately, not just "/".
  revalidatePath("/", "layout");
  return { ok: true, message: "Definições guardadas com sucesso." };
}
