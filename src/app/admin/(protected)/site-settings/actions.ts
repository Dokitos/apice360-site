"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { siteSettingsSchema } from "@/lib/validations/site-settings";
import { resolveMapLocation } from "@/lib/map-location";
import { resolveTranslations, type ExistingTranslationRow } from "@/lib/auto-translate";

export type SiteSettingsFormState = { ok: boolean; message: string } | undefined;

const SETTINGS_FIELDS = [
  { key: "footerDescription" },
  { key: "footerLegal" },
  { key: "footerTagline" },
  { key: "showroomText" },
  { key: "defaultSeoTitle" },
  { key: "defaultSeoDescription" },
];

function readForm(formData: FormData) {
  return {
    ...Object.fromEntries(formData.entries()),
    architectAreaEnabled: formData.get("architectAreaEnabled") === "on",
    lsfPageEnabled: formData.get("lsfPageEnabled") === "on",
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
    footerLegalPt, footerLegalEn, footerLegalEs, footerLegalFr,
    footerTaglinePt, footerTaglineEn, footerTaglineEs, footerTaglineFr,
    showroomTextPt, showroomTextEn, showroomTextEs, showroomTextFr,
    defaultSeoTitlePt, defaultSeoTitleEn, defaultSeoTitleEs, defaultSeoTitleFr,
    defaultSeoDescriptionPt, defaultSeoDescriptionEn, defaultSeoDescriptionEs, defaultSeoDescriptionFr,
    mapLocation,
    ...data
  } = parsed.data;

  // O campo aceita um link do Google Maps ou um par de coordenadas; aqui
  // vira latitude/longitude. Um erro aqui é devolvido ao editor em vez de
  // gravar o resto e deixar o mapa a apontar para o sítio errado em silêncio.
  let mapCoordinates: { mapLatitude: number | null; mapLongitude: number | null } | null = null;
  if (mapLocation !== undefined) {
    if (!mapLocation) {
      mapCoordinates = { mapLatitude: null, mapLongitude: null };
    } else {
      const resolved = await resolveMapLocation(mapLocation);
      if (!resolved.ok) return { ok: false, message: resolved.error };
      mapCoordinates = { mapLatitude: resolved.location.latitude, mapLongitude: resolved.location.longitude };
    }
  }

  const existing = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: { translations: true },
  });
  const existingTranslations: ExistingTranslationRow[] = existing?.translations ?? [];

  const resolved = await resolveTranslations({
    fields: SETTINGS_FIELDS,
    ptValues: {
      footerDescription: footerDescriptionPt ?? null,
      footerLegal: footerLegalPt ?? null,
      footerTagline: footerTaglinePt ?? null,
      showroomText: showroomTextPt ?? null,
      defaultSeoTitle: defaultSeoTitlePt ?? null,
      defaultSeoDescription: defaultSeoDescriptionPt ?? null,
    },
    submittedValues: {
      EN: { footerDescription: footerDescriptionEn ?? null, footerLegal: footerLegalEn ?? null, footerTagline: footerTaglineEn ?? null, showroomText: showroomTextEn ?? null, defaultSeoTitle: defaultSeoTitleEn ?? null, defaultSeoDescription: defaultSeoDescriptionEn ?? null },
      ES: { footerDescription: footerDescriptionEs ?? null, footerLegal: footerLegalEs ?? null, footerTagline: footerTaglineEs ?? null, showroomText: showroomTextEs ?? null, defaultSeoTitle: defaultSeoTitleEs ?? null, defaultSeoDescription: defaultSeoDescriptionEs ?? null },
      FR: { footerDescription: footerDescriptionFr ?? null, footerLegal: footerLegalFr ?? null, footerTagline: footerTaglineFr ?? null, showroomText: showroomTextFr ?? null, defaultSeoTitle: defaultSeoTitleFr ?? null, defaultSeoDescription: defaultSeoDescriptionFr ?? null },
    },
    existingTranslations,
  });

  const translations = [
    {
      locale: "PT" as const,
      isAutoTranslated: false,
      footerDescription: footerDescriptionPt ?? null,
      footerLegal: footerLegalPt ?? null,
      footerTagline: footerTaglinePt ?? null,
      showroomText: showroomTextPt ?? null,
      defaultSeoTitle: defaultSeoTitlePt ?? null,
      defaultSeoDescription: defaultSeoDescriptionPt ?? null,
    },
    ...resolved.map((r) => ({
      locale: r.locale,
      isAutoTranslated: r.isAutoTranslated,
      footerDescription: r.fields.footerDescription,
      footerLegal: r.fields.footerLegal,
      footerTagline: r.fields.footerTagline,
      showroomText: r.fields.showroomText,
      defaultSeoTitle: r.fields.defaultSeoTitle,
      defaultSeoDescription: r.fields.defaultSeoDescription,
    })),
  ];

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    update: {
      ...data,
      ...(mapCoordinates ?? {}),
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
      ...(mapCoordinates ?? {}),
      translations: { create: translations },
    },
  });

  revalidatePath("/admin/site-settings");
  // "layout" so the maintenance-mode / architect-area gate in the public
  // (public)/layout.tsx re-evaluates on every page immediately, not just "/".
  revalidatePath("/", "layout");
  return { ok: true, message: "Definições guardadas com sucesso." };
}
