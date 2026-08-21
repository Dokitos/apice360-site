import { z } from "zod";

export const pageSeoSchema = z.object({
  ogImageUrl: z.string().trim().url("Indica um URL de imagem válido.").optional().or(z.literal("")),
  titlePt: z.string().trim().min(1, "Indica o título SEO em Português."),
  titleEn: z.string().trim().optional().or(z.literal("")),
  titleEs: z.string().trim().optional().or(z.literal("")),
  titleFr: z.string().trim().optional().or(z.literal("")),
  descriptionPt: z.string().trim().min(1, "Escreve a descrição SEO em Português."),
  descriptionEn: z.string().trim().optional().or(z.literal("")),
  descriptionEs: z.string().trim().optional().or(z.literal("")),
  descriptionFr: z.string().trim().optional().or(z.literal("")),
});
