"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Script from "next/script";
import { COOKIE_CONSENT_EVENT, COOKIE_CONSENT_KEY } from "@/components/layout/CookieConsent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics e pixel do Meta Ads, ambos atrás do consentimento de
 * cookies: sem "aceitar", nenhum dos scripts chega a ser carregado.
 *
 * Os IDs vêm das Definições do Site (painel) para o cliente os poder trocar
 * sem um deploy. A variável NEXT_PUBLIC_GA_MEASUREMENT_ID continua a valer
 * como recurso, para não partir instalações que ainda a usem — o painel
 * ganha sempre.
 */
export function Analytics({
  gaMeasurementId,
  metaPixelId,
}: {
  gaMeasurementId?: string | null;
  metaPixelId?: string | null;
}) {
  const [consented, setConsented] = useState(false);
  const pathname = usePathname();

  const gaId = gaMeasurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || null;
  const pixelId = metaPixelId || null;

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

  // Numa SPA a navegação não recarrega a página, e o pixel do Meta só conta a
  // vista de entrada — as campanhas ficariam sem o resto do percurso. O GA4
  // não precisa disto: a medição avançada já regista as mudanças de histórico
  // sozinha, e repetir aqui daria vistas de página a dobrar.
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (!consented) return;
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
  }, [pathname, consented]);

  if (!consented) return null;

  return (
    <>
      {gaId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}');
            `}
          </Script>
        </>
      ) : null}

      {pixelId ? (
        // Sem o <noscript><img> do snippet oficial: esse dispara o pixel na
        // simples entrega do HTML, antes de haver consentimento, e quem tem
        // JavaScript desligado também não viu o aviso de cookies.
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      ) : null}
    </>
  );
}
