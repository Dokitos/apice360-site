import { z } from "zod";

const optionalUrl = z.string().trim().url("Indica um URL válido.").optional().or(z.literal(""));

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
  footerDescriptionPt: z.string().trim().optional().or(z.literal("")),
  footerDescriptionEn: z.string().trim().optional().or(z.literal("")),
  showroomTextPt: z.string().trim().optional().or(z.literal("")),
  showroomTextEn: z.string().trim().optional().or(z.literal("")),
  defaultSeoTitlePt: z.string().trim().optional().or(z.literal("")),
  defaultSeoTitleEn: z.string().trim().optional().or(z.literal("")),
  defaultSeoDescriptionPt: z.string().trim().optional().or(z.literal("")),
  defaultSeoDescriptionEn: z.string().trim().optional().or(z.literal("")),
});
