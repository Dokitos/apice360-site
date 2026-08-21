import { cookies } from "next/headers";
import { SITE_LOCALES, type SiteLocale } from "@/lib/site-locales";

export type { SiteLocale };
export const LOCALE_COOKIE = "NEXT_LOCALE";

/** Server-side: reads the visitor's chosen locale from a cookie, defaulting to PT. */
export async function getLocale(): Promise<SiteLocale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return (SITE_LOCALES as readonly string[]).includes(value ?? "") ? (value as SiteLocale) : "PT";
}
