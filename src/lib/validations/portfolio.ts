import { z } from "zod";
import { imageUrl, optionalImageUrl } from "@/lib/validations/image-url";

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
  coverImageUrl: optionalImageUrl,
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
  url: imageUrl,
  alt: z.string().trim().optional().or(z.literal("")),
  order: z.coerce.number().int(),
});

/**
 * A galeria chega do formulário como JSON num campo escondido — é uma lista
 * ordenada que o editor monta no browser, e mandá-la inteira de uma vez
 * evita inventar um nome de campo por imagem. A ordem do array é a ordem
 * com que aparecem no site.
 */
export const galleryImagesSchema = z.array(
  z.object({
    url: imageUrl,
    alt: z.string().trim().max(300).optional().default(""),
  }),
);

export function parseGalleryImages(raw: FormDataEntryValue | null): { url: string; alt: string }[] | null {
  if (typeof raw !== "string" || raw.trim() === "") return [];
  try {
    const parsed = galleryImagesSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    return parsed.data.map((img) => ({ url: img.url, alt: img.alt ?? "" }));
  } catch {
    return null;
  }
}
