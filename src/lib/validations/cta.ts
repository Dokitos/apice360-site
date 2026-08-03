import { z } from "zod";

export const ctaSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Indica a chave do CTA.")
    .regex(/^[a-z0-9_]+$/, "Usa apenas minúsculas, números e underscore (ex: home_hero)."),
  url: z.string().trim().min(1, "Indica o destino do botão (URL ou link do WhatsApp)."),
  style: z.string().trim().min(1).default("primary"),
  iconName: z.string().trim().optional().or(z.literal("")),
  isActive: z.boolean(),
  labelPt: z.string().trim().min(1, "Indica o texto em Português."),
  labelEn: z.string().trim().min(1, "Indica o texto em Inglês."),
});
