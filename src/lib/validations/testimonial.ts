import { z } from "zod";
import { optionalImageUrl } from "@/lib/validations/image-url";

export const testimonialSchema = z.object({
  authorName: z.string().trim().min(1, "Indica o nome do cliente."),
  location: z.string().trim().optional().or(z.literal("")),
  avatarUrl: optionalImageUrl,
  rating: z.coerce.number().int().min(1).max(5),
  order: z.coerce.number().int(),
  showOnHome: z.boolean(),
  isActive: z.boolean(),
  quotePt: z.string().trim().min(1, "Escreve o depoimento em Português."),
  quoteEn: z.string().trim().optional().or(z.literal("")),
  quoteEs: z.string().trim().optional().or(z.literal("")),
  quoteFr: z.string().trim().optional().or(z.literal("")),
});
