import { z } from "zod";

export const partnerSchema = z.object({
  name: z.string().trim().min(1, "Indica o nome do parceiro."),
  logoUrl: z.string().trim().url("Indica um URL de imagem válido."),
  websiteUrl: z
    .string()
    .trim()
    .url("Indica um URL válido.")
    .optional()
    .or(z.literal("")),
  order: z.coerce.number().int().default(0),
  // Parse checkboxes explicitly in the action (`formData.get("x") === "on"`) before
  // validating — an unchecked checkbox is simply absent from FormData, not "false".
  isActive: z.boolean(),
});
