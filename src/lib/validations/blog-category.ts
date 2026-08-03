import { z } from "zod";

const slugField = z
  .string()
  .trim()
  .min(1, "Indica o slug.")
  .regex(/^[a-z0-9-]+$/, "Usa apenas minúsculas, números e hífen.");

export const blogCategorySchema = z.object({
  order: z.coerce.number().int(),
  namePt: z.string().trim().min(1, "Indica o nome em Português."),
  nameEn: z.string().trim().min(1, "Indica o nome em Inglês."),
  slugPt: slugField,
  slugEn: slugField,
});
