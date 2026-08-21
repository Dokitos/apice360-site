import { z } from "zod";

export const serviceSchema = z.object({
  type: z
    .string()
    .trim()
    .min(1, "Indica o identificador do serviço.")
    .regex(/^[a-z0-9-]+$/, "Usa apenas minúsculas, números e hífen (ex: lsf, remodelacao-total)."),
  order: z.coerce.number().int(),
  imageUrl: z.string().trim().url("Indica um URL de imagem válido.").optional().or(z.literal("")),
  ctaKey: z.string().trim().optional().or(z.literal("")),
  isActive: z.boolean(),
  cardLabelPt: z.string().trim().min(1, "Indica o rótulo do cartão em Português."),
  cardLabelEn: z.string().trim().optional().or(z.literal("")),
  cardLabelEs: z.string().trim().optional().or(z.literal("")),
  cardLabelFr: z.string().trim().optional().or(z.literal("")),
  titlePt: z.string().trim().min(1, "Indica o título em Português."),
  titleEn: z.string().trim().optional().or(z.literal("")),
  titleEs: z.string().trim().optional().or(z.literal("")),
  titleFr: z.string().trim().optional().or(z.literal("")),
  introPt: z.string().trim().min(1, "Escreve a introdução em Português."),
  introEn: z.string().trim().optional().or(z.literal("")),
  introEs: z.string().trim().optional().or(z.literal("")),
  introFr: z.string().trim().optional().or(z.literal("")),
});

export const serviceFeatureSchema = z.object({
  iconName: z.string().trim().optional().or(z.literal("")),
  order: z.coerce.number().int(),
  titlePt: z.string().trim().min(1, "Indica o título em Português."),
  titleEn: z.string().trim().optional().or(z.literal("")),
  titleEs: z.string().trim().optional().or(z.literal("")),
  titleFr: z.string().trim().optional().or(z.literal("")),
  bodyPt: z.string().trim().optional().or(z.literal("")),
  bodyEn: z.string().trim().optional().or(z.literal("")),
  bodyEs: z.string().trim().optional().or(z.literal("")),
  bodyFr: z.string().trim().optional().or(z.literal("")),
});
