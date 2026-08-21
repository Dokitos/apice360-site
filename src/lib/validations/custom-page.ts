import { z } from "zod";

// Every path segment already used by a fixed route, plus the "/paginas"
// prefix itself and Next.js's own reserved directories — a custom page
// can never shadow one of these.
const RESERVED_SLUGS = new Set([
  "admin",
  "api",
  "quem-somos",
  "servicos",
  "portfolio",
  "blog",
  "contacto",
  "area-do-arquiteto",
  "privacidade",
  "paginas",
]);

const optionalText = z.string().trim().optional().or(z.literal(""));

export const customPageSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Indica o slug da página.")
    .regex(/^[a-z0-9-]+$/, "Usa apenas minúsculas, números e hífen.")
    .refine((v) => !RESERVED_SLUGS.has(v), "Este slug está reservado, escolhe outro."),
  order: z.coerce.number().int(),
  showInMenu: z.boolean(),
  isPublished: z.boolean(),
  navLabelPt: z.string().trim().min(1, "Indica o texto do menu em Português."),
  navLabelEn: optionalText,
  navLabelEs: optionalText,
  navLabelFr: optionalText,
  headingPt: optionalText,
  headingEn: optionalText,
  headingEs: optionalText,
  headingFr: optionalText,
  seoTitlePt: optionalText,
  seoTitleEn: optionalText,
  seoTitleEs: optionalText,
  seoTitleFr: optionalText,
  seoDescriptionPt: optionalText,
  seoDescriptionEn: optionalText,
  seoDescriptionEs: optionalText,
  seoDescriptionFr: optionalText,
});
