import { z } from "zod";

const slugField = z
  .string()
  .trim()
  .min(1, "Indica o slug.")
  .regex(/^[a-z0-9-]+$/, "Usa apenas minúsculas, números e hífen.");

const optionalSlugField = z
  .string()
  .trim()
  .regex(/^[a-z0-9-]*$/, "Usa apenas minúsculas, números e hífen.")
  .optional()
  .or(z.literal(""));

const optionalText = z.string().trim().optional().or(z.literal(""));

export const blogCategorySchema = z.object({
  order: z.coerce.number().int(),
  namePt: z.string().trim().min(1, "Indica o nome em Português."),
  nameEn: optionalText,
  nameEs: optionalText,
  nameFr: optionalText,
  slugPt: slugField,
  slugEn: optionalSlugField,
  slugEs: optionalSlugField,
  slugFr: optionalSlugField,
});
