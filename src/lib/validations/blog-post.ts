import { z } from "zod";

export const blogPostSchema = z.object({
  categoryId: z.string().trim().optional().or(z.literal("")),
  featuredImageUrl: z.string().trim().url("Indica um URL de imagem válido.").optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  slugPt: z
    .string()
    .trim()
    .min(1, "Indica o slug em Português.")
    .regex(/^[a-z0-9-]+$/, "Usa apenas minúsculas, números e hífen."),
  slugEn: z
    .string()
    .trim()
    .min(1, "Indica o slug em Inglês.")
    .regex(/^[a-z0-9-]+$/, "Usa apenas minúsculas, números e hífen."),
  titlePt: z.string().trim().min(1, "Indica o título em Português."),
  titleEn: z.string().trim().min(1, "Indica o título em Inglês."),
  excerptPt: z.string().trim().optional().or(z.literal("")),
  excerptEn: z.string().trim().optional().or(z.literal("")),
  bodyHtmlPt: z.string().trim().min(1, "Escreve o conteúdo do artigo em Português."),
  bodyHtmlEn: z.string().trim().min(1, "Escreve o conteúdo do artigo em Inglês."),
  seoTitlePt: z.string().trim().optional().or(z.literal("")),
  seoTitleEn: z.string().trim().optional().or(z.literal("")),
  seoDescriptionPt: z.string().trim().optional().or(z.literal("")),
  seoDescriptionEn: z.string().trim().optional().or(z.literal("")),
});
