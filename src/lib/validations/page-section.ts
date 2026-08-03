import { z } from "zod";

export const pageSectionSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Indica a chave da secção.")
    .regex(/^[a-z0-9_]+$/, "Usa apenas minúsculas, números e underscore (ex: why_choose)."),
  imageUrl: z.string().trim().url("Indica um URL de imagem válido.").optional().or(z.literal("")),
  iconName: z.string().trim().optional().or(z.literal("")),
  order: z.coerce.number().int(),
  isActive: z.boolean(),
  eyebrowPt: z.string().trim().optional().or(z.literal("")),
  eyebrowEn: z.string().trim().optional().or(z.literal("")),
  headingPt: z.string().trim().optional().or(z.literal("")),
  headingEn: z.string().trim().optional().or(z.literal("")),
  subheadingPt: z.string().trim().optional().or(z.literal("")),
  subheadingEn: z.string().trim().optional().or(z.literal("")),
  bodyPt: z.string().trim().optional().or(z.literal("")),
  bodyEn: z.string().trim().optional().or(z.literal("")),
  ctaLabelPt: z.string().trim().optional().or(z.literal("")),
  ctaLabelEn: z.string().trim().optional().or(z.literal("")),
});

export const pageSectionItemSchema = z.object({
  iconName: z.string().trim().optional().or(z.literal("")),
  imageUrl: z.string().trim().url("Indica um URL de imagem válido.").optional().or(z.literal("")),
  numberLabel: z.string().trim().optional().or(z.literal("")),
  order: z.coerce.number().int(),
  titlePt: z.string().trim().min(1, "Indica o título em Português."),
  titleEn: z.string().trim().min(1, "Indica o título em Inglês."),
  bodyPt: z.string().trim().optional().or(z.literal("")),
  bodyEn: z.string().trim().optional().or(z.literal("")),
});
