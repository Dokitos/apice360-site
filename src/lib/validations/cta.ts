import { z } from "zod";

// Blocks javascript:/data: schemes (stored XSS via CTA href) while still
// allowing absolute http(s) links, relative in-site paths (/servicos),
// mailto: and tel:.
const SAFE_CTA_URL = /^(https?:\/\/|mailto:|tel:|\/(?!\/))/i;

export const ctaSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Indica a chave do CTA.")
    .regex(/^[a-z0-9_]+$/, "Usa apenas minúsculas, números e underscore (ex: home_hero)."),
  url: z
    .string()
    .trim()
    .min(1, "Indica o destino do botão (URL ou link do WhatsApp).")
    // Quality-of-life: a pasted link like "wa.me/351..." or "www.site.com"
    // is missing its scheme — assume https:// rather than reject it.
    .transform((v) => (SAFE_CTA_URL.test(v) ? v : `https://${v}`))
    .refine((v) => SAFE_CTA_URL.test(v), "Usa um link http(s), mailto:, tel: ou um caminho relativo (/pagina)."),
  style: z.string().trim().min(1).default("primary"),
  iconName: z.string().trim().optional().or(z.literal("")),
  isActive: z.boolean(),
  labelPt: z.string().trim().min(1, "Indica o texto em Português."),
  labelEn: z.string().trim().min(1, "Indica o texto em Inglês."),
});
