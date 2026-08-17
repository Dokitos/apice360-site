"use client";

import { MANAGE_COOKIE_PREFERENCES_EVENT } from "@/components/layout/CookieConsent";

export function ManageCookiePreferencesButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(MANAGE_COOKIE_PREFERENCES_EVENT))}
      className="cursor-pointer rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-primary transition-all hover:scale-105"
    >
      {label}
    </button>
  );
}
