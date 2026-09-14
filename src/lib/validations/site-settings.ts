import { z } from "zod";

const optionalUrl = z.string().trim().url("Indica um URL válido.").optional().or(z.literal(""));

// Os IDs de tracking são validados pelo formato porque um ID errado não dá
// erro nenhum: o script carrega, não regista nada, e só se dá pela falta
// semanas depois, ao olhar para relatórios vazios.
const gaMeasurementId = z
  .string()
  .trim()
  .regex(/^G-[A-Z0-9]{6,}$/i, "O ID do Google Analytics tem o formato G-XXXXXXXXXX.")
  .optional()
  .or(z.literal(""));

const metaPixelId = z
  .string()
  .trim()
  .regex(/^\d{10,20}$/, "O ID do pixel do Meta é composto apenas por dígitos (normalmente 15 ou 16).")
  .optional()
  .or(z.literal(""));

export const siteSettingsSchema = z.object({
  phone: z.string().trim().optional().or(z.literal("")),
  whatsappCommercial: optionalUrl,
  whatsappGeneral: optionalUrl,
  email: z.string().trim().email("Indica um email válido.").optional().or(z.literal("")),
  addressLine: z.string().trim().optional().or(z.literal("")),
  addressCity: z.string().trim().optional().or(z.literal("")),
  addressPostalCode: z.string().trim().optional().or(z.literal("")),
  addressCountry: z.string().trim().optional().or(z.literal("")),
  mapEmbedUrl: optionalUrl,
  socialFacebook: optionalUrl,
  socialInstagram: optionalUrl,
  socialLinkedin: optionalUrl,
  socialYoutube: optionalUrl,
  defaultOgImageUrl: optionalUrl,
  nif: z.string().trim().optional().or(z.literal("")),
  partnersDisplayMode: z.enum(["GRID", "CAROUSEL"]).default("GRID"),
  architectAreaEnabled: z.boolean(),
  lsfPageEnabled: z.boolean(),
  maintenanceMode: z.boolean(),
  gaMeasurementId,
  metaPixelId,
  footerDescriptionPt: z.string().trim().optional().or(z.literal("")),
  footerDescriptionEn: z.string().trim().optional().or(z.literal("")),
  footerDescriptionEs: z.string().trim().optional().or(z.literal("")),
  footerDescriptionFr: z.string().trim().optional().or(z.literal("")),
  showroomTextPt: z.string().trim().optional().or(z.literal("")),
  showroomTextEn: z.string().trim().optional().or(z.literal("")),
  showroomTextEs: z.string().trim().optional().or(z.literal("")),
  showroomTextFr: z.string().trim().optional().or(z.literal("")),
  defaultSeoTitlePt: z.string().trim().optional().or(z.literal("")),
  defaultSeoTitleEn: z.string().trim().optional().or(z.literal("")),
  defaultSeoTitleEs: z.string().trim().optional().or(z.literal("")),
  defaultSeoTitleFr: z.string().trim().optional().or(z.literal("")),
  defaultSeoDescriptionPt: z.string().trim().optional().or(z.literal("")),
  defaultSeoDescriptionEn: z.string().trim().optional().or(z.literal("")),
  defaultSeoDescriptionEs: z.string().trim().optional().or(z.literal("")),
  defaultSeoDescriptionFr: z.string().trim().optional().or(z.literal("")),
});
