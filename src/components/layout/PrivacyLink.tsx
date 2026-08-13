"use client";

import { PRIVACY_MODAL_EVENT } from "@/components/layout/CookieConsent";

export function PrivacyLink() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(PRIVACY_MODAL_EVENT))}
      className="cursor-pointer transition-colors hover:text-primary"
    >
      Privacidade
    </button>
  );
}
