import { z } from "zod";

export const serviceSchema = z.object({
  imageUrl: z.string().trim().url("Indica um URL de imagem válido.").optional().or(z.literal("")),
  ctaKey: z.string().trim().optional().or(z.literal("")),
  isActive: z.boolean(),
  cardLabelPt: z.string().trim().min(1, "Indica o rótulo do cartão em Português."),
  cardLabelEn: z.string().trim().min(1, "Indica o rótulo do cartão em Inglês."),
  titlePt: z.string().trim().min(1, "Indica o título em Português."),
  titleEn: z.string().trim().min(1, "Indica o título em Inglês."),
  introPt: z.string().trim().min(1, "Escreve a introdução em Português."),
  introEn: z.string().trim().min(1, "Escreve a introdução em Inglês."),
});

export const serviceFeatureSchema = z.object({
  iconName: z.string().trim().optional().or(z.literal("")),
  order: z.coerce.number().int(),
  titlePt: z.string().trim().min(1, "Indica o título em Português."),
  titleEn: z.string().trim().min(1, "Indica o título em Inglês."),
  bodyPt: z.string().trim().optional().or(z.literal("")),
  bodyEn: z.string().trim().optional().or(z.literal("")),
});
