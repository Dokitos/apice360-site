import type { PageKeyValue } from "@/lib/content";

/**
 * Section keys each page already renders through a hand-built layout
 * component (not the generic fallback). Used to decide which sections on a
 * page are "extra"/admin-created and should go through GenericPageSection.
 */
export const KNOWN_PAGE_SECTION_KEYS: Record<PageKeyValue, string[]> = {
  HOME: ["hero", "partners", "why_choose", "results", "blog_preview"],
  QUEM_SOMOS: ["intro", "history", "method", "values"],
  SERVICOS: ["intro", "management_model"],
  PORTFOLIO: ["intro"],
  BLOG: ["intro"],
  CONTACTO: ["intro", "triagem"],
  AREA_ARQUITETO: ["intro"],
};

/**
 * For hand-built sections whose CTA slot is a specific hardcoded getCta()
 * key, picking that section in the CTA admin's "where does this appear?"
 * picker is really just a friendlier way to pick that same known key
 * directly — keyed by `${page}:${sectionKey}`. Every other hand-built
 * section (history/method/values/intro pages) instead links through
 * section.ctaKey like a generic section, since their layout component
 * accepts an optional `cta` prop.
 */
export const FIXED_CTA_KEY_BY_SECTION: Record<string, string> = {
  "HOME:hero": "home_hero",
  "HOME:why_choose": "why_choose_services",
  "HOME:results": "results_portfolio",
  "HOME:blog_preview": "blog_see_more",
  "SERVICOS:management_model": "services_final_cta",
  "CONTACTO:triagem": "contact_whatsapp_commercial",
};

/** Sections whose layout structurally has no CTA button (e.g. a logo grid) — hidden from the CTA picker entirely. */
export const NO_CTA_SECTIONS = new Set<string>(["HOME:partners"]);

export const PAGE_LABELS: Record<PageKeyValue, string> = {
  HOME: "Início",
  QUEM_SOMOS: "Quem Somos",
  SERVICOS: "Serviços",
  PORTFOLIO: "Portfólio",
  BLOG: "Blog",
  CONTACTO: "Contacto",
  AREA_ARQUITETO: "Área do Arquiteto",
};
