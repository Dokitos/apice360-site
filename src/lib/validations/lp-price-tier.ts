import { z } from "zod";

const optionalText = z.string().trim().optional().or(z.literal(""));

export const lpPriceTierSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Indica a chave do escalão.")
    .regex(/^[a-z0-9_]+$/, "Usa apenas minúsculas, números e underscore (ex: conforto)."),
  pricePerM2: z.coerce
    .number({ error: "Indica o preço por m²." })
    .int("O preço por m² tem de ser um número inteiro.")
    .min(1, "O preço por m² tem de ser maior que zero.")
    .max(100000, "Esse preço por m² não parece correto."),
  order: z.coerce.number().int(),
  isHighlighted: z.boolean(),
  isActive: z.boolean(),
  iconName: optionalText,
  labelPt: z.string().trim().min(1, "Indica o nome do escalão em Português."),
  labelEn: optionalText,
  labelEs: optionalText,
  labelFr: optionalText,
  descriptionPt: optionalText,
  descriptionEn: optionalText,
  descriptionEs: optionalText,
  descriptionFr: optionalText,
  featuresPt: optionalText,
  featuresEn: optionalText,
  featuresEs: optionalText,
  featuresFr: optionalText,
});
