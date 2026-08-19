import type { PageKeyValue } from "@/lib/content";

/**
 * Section keys each page already renders through a hand-built layout
 * component (not the generic fallback). Used to (a) decide which sections
 * on a page are "extra"/admin-created and should go through
 * GenericPageSection, and (b) exclude hand-built sections from the CTA
 * admin's "link to a section" picker, since their CTA slot is a separate
 * hardcoded getCta() call, not section.ctaKey.
 */
export const KNOWN_PAGE_SECTION_KEYS: Record<PageKeyValue, string[]> = {
  HOME: ["hero", "partners", "why_choose", "results", "blog_preview"],
  QUEM_SOMOS: ["intro", "history", "method", "values"],
  SERVICOS: ["intro", "management_model"],
  PORTFOLIO: [],
  BLOG: [],
  CONTACTO: ["triagem"],
  AREA_ARQUITETO: ["intro"],
};

export const PAGE_LABELS: Record<PageKeyValue, string> = {
  HOME: "Início",
  QUEM_SOMOS: "Quem Somos",
  SERVICOS: "Serviços",
  PORTFOLIO: "Portfólio",
  BLOG: "Blog",
  CONTACTO: "Contacto",
  AREA_ARQUITETO: "Área do Arquiteto",
};
