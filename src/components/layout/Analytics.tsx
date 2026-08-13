"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { COOKIE_CONSENT_EVENT, COOKIE_CONSENT_KEY } from "@/components/layout/CookieConsent";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function Analytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    function checkStoredConsent() {
      setConsented(window.localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted");
    }
    checkStoredConsent();
    const onConsent = (e: Event) => {
      const value = (e as CustomEvent<"accepted" | "rejected">).detail;
      setConsented(value === "accepted");
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, onConsent);
  }, []);

  if (!GA_MEASUREMENT_ID || !consented) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
    </>
  );
}
