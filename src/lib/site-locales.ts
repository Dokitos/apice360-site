// Client-safe: no server-only imports (unlike src/lib/locale.ts, which
// needs next/headers for getLocale()). Anything a client component needs
// at runtime (not just as a type) belongs here instead.
export const SITE_LOCALES = ["PT", "EN", "ES", "FR"] as const;
export type SiteLocale = (typeof SITE_LOCALES)[number];
