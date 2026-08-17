import { cookies } from "next/headers";

export const LOCALE_COOKIE = "NEXT_LOCALE";
export type SiteLocale = "PT" | "EN";

/** Server-side: reads the visitor's chosen locale from a cookie, defaulting to PT. */
export async function getLocale(): Promise<SiteLocale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return value === "EN" ? "EN" : "PT";
}
