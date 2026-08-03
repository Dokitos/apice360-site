import { z } from "zod";

export const statSchema = z.object({
  value: z.string().trim().min(1, "Indica o valor (ex: 120+)."),
  iconName: z.string().trim().optional().or(z.literal("")),
  order: z.coerce.number().int(),
  isActive: z.boolean(),
  labelPt: z.string().trim().min(1, "Indica o rótulo em Português."),
  labelEn: z.string().trim().min(1, "Indica o rótulo em Inglês."),
});
