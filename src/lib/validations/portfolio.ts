import { z } from "zod";

export const portfolioProjectSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Indica o slug do projeto.")
    .regex(/^[a-z0-9-]+$/, "Usa apenas minúsculas, números e hífen."),
  category: z.enum(["LSF", "REMODELACAO"]),
  locationLabel: z.string().trim().optional().or(z.literal("")),
  clientName: z.string().trim().optional().or(z.literal("")),
  clientLocation: z.string().trim().optional().or(z.literal("")),
  coverImageUrl: z.string().trim().url("Indica um URL de imagem válido.").optional().or(z.literal("")),
  order: z.coerce.number().int(),
  isFeatured: z.boolean(),
  isPublished: z.boolean(),
  titlePt: z.string().trim().min(1, "Indica o título em Português."),
  titleEn: z.string().trim().optional().or(z.literal("")),
  titleEs: z.string().trim().optional().or(z.literal("")),
  titleFr: z.string().trim().optional().or(z.literal("")),
  shortDescriptionPt: z.string().trim().optional().or(z.literal("")),
  shortDescriptionEn: z.string().trim().optional().or(z.literal("")),
  shortDescriptionEs: z.string().trim().optional().or(z.literal("")),
  shortDescriptionFr: z.string().trim().optional().or(z.literal("")),
  challengePt: z.string().trim().optional().or(z.literal("")),
  challengeEn: z.string().trim().optional().or(z.literal("")),
  challengeEs: z.string().trim().optional().or(z.literal("")),
  challengeFr: z.string().trim().optional().or(z.literal("")),
  methodologyPt: z.string().trim().optional().or(z.literal("")),
  methodologyEn: z.string().trim().optional().or(z.literal("")),
  methodologyEs: z.string().trim().optional().or(z.literal("")),
  methodologyFr: z.string().trim().optional().or(z.literal("")),
  resultPt: z.string().trim().optional().or(z.literal("")),
  resultEn: z.string().trim().optional().or(z.literal("")),
  resultEs: z.string().trim().optional().or(z.literal("")),
  resultFr: z.string().trim().optional().or(z.literal("")),
  testimonialQuotePt: z.string().trim().optional().or(z.literal("")),
  testimonialQuoteEn: z.string().trim().optional().or(z.literal("")),
  testimonialQuoteEs: z.string().trim().optional().or(z.literal("")),
  testimonialQuoteFr: z.string().trim().optional().or(z.literal("")),
});

export const projectImageSchema = z.object({
  url: z.string().trim().url("Indica um URL de imagem válido."),
  alt: z.string().trim().optional().or(z.literal("")),
  order: z.coerce.number().int(),
});
