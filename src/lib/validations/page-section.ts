import { z } from "zod";

const optionalText = z.string().trim().optional().or(z.literal(""));

export const pageSectionSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Indica a chave da secção.")
    .regex(/^[a-z0-9_]+$/, "Usa apenas minúsculas, números e underscore (ex: why_choose)."),
  layout: z.enum(["standard", "grid", "timeline"]).default("standard"),
  imageUrl: z.string().trim().url("Indica um URL de imagem válido.").optional().or(z.literal("")),
  iconName: z.string().trim().optional().or(z.literal("")),
  ctaKey: z.string().trim().optional().or(z.literal("")),
  order: z.coerce.number().int(),
  isActive: z.boolean(),
  eyebrowPt: optionalText,
  eyebrowEn: optionalText,
  eyebrowEs: optionalText,
  eyebrowFr: optionalText,
  headingPt: optionalText,
  headingEn: optionalText,
  headingEs: optionalText,
  headingFr: optionalText,
  subheadingPt: optionalText,
  subheadingEn: optionalText,
  subheadingEs: optionalText,
  subheadingFr: optionalText,
  bodyPt: optionalText,
  bodyEn: optionalText,
  bodyEs: optionalText,
  bodyFr: optionalText,
  ctaLabelPt: optionalText,
  ctaLabelEn: optionalText,
  ctaLabelEs: optionalText,
  ctaLabelFr: optionalText,
});

export const pageSectionItemSchema = z.object({
  iconName: z.string().trim().optional().or(z.literal("")),
  imageUrl: z.string().trim().url("Indica um URL de imagem válido.").optional().or(z.literal("")),
  numberLabel: z.string().trim().optional().or(z.literal("")),
  ctaKey: z.string().trim().optional().or(z.literal("")),
  order: z.coerce.number().int(),
  titlePt: z.string().trim().min(1, "Indica o título em Português."),
  titleEn: optionalText,
  titleEs: optionalText,
  titleFr: optionalText,
  bodyPt: optionalText,
  bodyEn: optionalText,
  bodyEs: optionalText,
  bodyFr: optionalText,
});
