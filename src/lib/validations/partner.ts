import { z } from "zod";

// zod's .url() only checks the string is WHATWG-parseable — it accepts
// javascript:/data: URLs too, which would be a stored-XSS vector once
// rendered as an <a href>, so restrict explicitly to http(s).
const SAFE_HTTP_URL = /^https?:\/\//i;

export const partnerSchema = z.object({
  name: z.string().trim().min(1, "Indica o nome do parceiro."),
  logoUrl: z.string().trim().url("Indica um URL de imagem válido."),
  websiteUrl: z
    .string()
    .trim()
    .url("Indica um URL válido.")
    .refine((v) => v === "" || SAFE_HTTP_URL.test(v), "Usa um link http:// ou https://.")
    .optional()
    .or(z.literal("")),
  cardSize: z.enum(["SM", "MD", "LG"]).default("MD"),
  order: z.coerce.number().int().default(0),
  // Parse checkboxes explicitly in the action (`formData.get("x") === "on"`) before
  // validating — an unchecked checkbox is simply absent from FormData, not "false".
  isActive: z.boolean(),
});
