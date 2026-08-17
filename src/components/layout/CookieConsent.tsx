"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";

export const COOKIE_CONSENT_KEY = "apice360-cookie-consent";
export const COOKIE_CONSENT_EVENT = "apice360:cookie-consent";
export const MANAGE_COOKIE_PREFERENCES_EVENT = "apice360:manage-cookie-preferences";

export function CookieConsent({ locale = "PT" }: { locale?: SiteLocale }) {
  const dict = getDictionary(locale);
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    function checkStoredConsent() {
      if (!window.localStorage.getItem(COOKIE_CONSENT_KEY)) {
        setBannerVisible(true);
      }
    }
    checkStoredConsent();

    function openPreferences() {
      window.localStorage.removeItem(COOKIE_CONSENT_KEY);
      setBannerVisible(true);
    }
    window.addEventListener(MANAGE_COOKIE_PREFERENCES_EVENT, openPreferences);
    return () => window.removeEventListener(MANAGE_COOKIE_PREFERENCES_EVENT, openPreferences);
  }, []);

  function setConsent(value: "accepted" | "rejected") {
    window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_EVENT, { detail: value }));
    setBannerVisible(false);
  }

  if (!bannerVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] px-4 pb-4">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-2xl border border-outline bg-surface-container p-6 shadow-2xl sm:flex-row sm:p-8">
        <p className="flex-1 text-sm leading-relaxed text-on-surface-variant">
          {dict.privacy.bannerPrefix}
          <Link href="/privacidade" className="font-bold text-primary underline hover:text-primary-deep">
            {dict.privacy.bannerLinkLabel}
          </Link>
          {dict.privacy.bannerSuffix}
        </p>
        <div className="flex w-full shrink-0 gap-3 sm:w-auto">
          <button
            type="button"
            onClick={() => setConsent("rejected")}
            className="flex-1 rounded-full border border-outline px-5 py-3 text-sm font-bold uppercase tracking-wide text-on-surface transition-colors hover:bg-surface-container-high sm:flex-none"
          >
            {dict.privacy.reject}
          </button>
          <button
            type="button"
            onClick={() => setConsent("accepted")}
            className="flex-1 rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-primary transition-all hover:scale-105 sm:flex-none"
          >
            {dict.privacy.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}
