import { z } from "zod";

const optionalSlugField = z
  .string()
  .trim()
  .regex(/^[a-z0-9-]*$/, "Usa apenas minúsculas, números e hífen.")
  .optional()
  .or(z.literal(""));

const optionalText = z.string().trim().optional().or(z.literal(""));

export const blogPostSchema = z.object({
  categoryId: z.string().trim().optional().or(z.literal("")),
  featuredImageUrl: z.string().trim().url("Indica um URL de imagem válido.").optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  slugPt: z
    .string()
    .trim()
    .min(1, "Indica o slug em Português.")
    .regex(/^[a-z0-9-]+$/, "Usa apenas minúsculas, números e hífen."),
  slugEn: optionalSlugField,
  slugEs: optionalSlugField,
  slugFr: optionalSlugField,
  titlePt: z.string().trim().min(1, "Indica o título em Português."),
  titleEn: optionalText,
  titleEs: optionalText,
  titleFr: optionalText,
  excerptPt: optionalText,
  excerptEn: optionalText,
  excerptEs: optionalText,
  excerptFr: optionalText,
  bodyHtmlPt: z.string().trim().min(1, "Escreve o conteúdo do artigo em Português."),
  bodyHtmlEn: optionalText,
  bodyHtmlEs: optionalText,
  bodyHtmlFr: optionalText,
  seoTitlePt: optionalText,
  seoTitleEn: optionalText,
  seoTitleEs: optionalText,
  seoTitleFr: optionalText,
  seoDescriptionPt: optionalText,
  seoDescriptionEn: optionalText,
  seoDescriptionEs: optionalText,
  seoDescriptionFr: optionalText,
});
