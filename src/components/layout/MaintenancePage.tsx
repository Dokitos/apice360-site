import type { CSSProperties } from "react";
import { ArrowUpRight, MessageCircle, Phone } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";
import styles from "./MaintenancePage.module.css";

type MaintenancePageProps = {
  locale: SiteLocale;
  whatsappUrl?: string | null;
  phone?: string | null;
};

const phase = (seconds: number) => ({ "--phase": `${seconds}s` }) as CSSProperties;

/** Decorative steel-frame assembly, rendered entirely with SVG and CSS. */
function SteelFrameIllustration() {
  return (
    <div className={styles.scene} aria-hidden="true">
      <div className={styles.sceneGrid} />
      <span className={styles.drawingLabel}>LSF / LIGHT STEEL FRAME</span>
      <svg viewBox="40 0 600 500" className={styles.drawing} fill="none" focusable="false">
        <defs>
          <linearGradient id="lsf-ground" x1="120" y1="290" x2="510" y2="430" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ecebe5" /><stop offset="1" stopColor="#f8f7f3" />
          </linearGradient>
        </defs>
        <ellipse cx="330" cy="411" rx="245" ry="45" fill="#20272b" opacity=".035" />
        <path d="M96 366 304 250 560 322 353 443Z" fill="url(#lsf-ground)" stroke="#d9dcd5" />
        <g stroke="#c8cfc7" strokeWidth="1" strokeDasharray="4 7" opacity=".65">
          <path d="M115 365V205L234 133 422 31 540 167V327L353 430 115 365 304 263 540 327M115 205 353 270 540 167M353 430V270L234 133M304 263V103L422 31M115 205 304 103 540 167" />
          <path d="M78 393 347 469M373 467 578 350M78 390 78 408M347 462V480M572 340 587 348" />
        </g>
        <g className={styles.beams} style={phase(0)} stroke="#a0a99e" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round">
          <path pathLength="1" d="M115 365 353 430 540 327 304 263Z" />
        </g>
        <g className={styles.beams} style={phase(.8)} stroke="#647365" strokeWidth="3" strokeLinecap="round">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <path pathLength="1" key={i} d={`M${115 + i * 34} ${365 + i * 65 / 7}V${205 + i * 65 / 7}`} />)}
          <path pathLength="1" d="M115 205 353 270M115 285 353 350" />
        </g>
        <g className={styles.beams} style={phase(1.8)} stroke="#879486" strokeWidth="3" strokeLinecap="round">
          {[1, 2, 3, 4, 5, 6].map((i) => <path pathLength="1" key={i} d={`M${353 + i * 187 / 6} ${430 - i * 103 / 6}V${270 - i * 103 / 6}`} />)}
          <path pathLength="1" d="M353 270 540 167M353 350 540 247M304 263V103M115 205 304 103 540 167" />
        </g>
        <g className={styles.beams} style={phase(2.8)} stroke="#ff6a13" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
          <path pathLength="1" d="M115 205 234 133 353 270M304 103 422 31 540 167M234 133 422 31" />
          <path pathLength="1" d="M178 171 367 69M296 204 485 103M234 133V237M422 31V135" />
        </g>
        <g className={styles.beams} style={phase(3.6)} stroke="#9da99c" strokeWidth="2" strokeLinecap="round">
          <path pathLength="1" d="M115 365 183 224M251 402 353 270M384 413 478 201M353 430 540 167" />
        </g>
        <g className={styles.nodes} fill="#ff6a13">
          <circle cx="115" cy="205" r="4" /><circle cx="353" cy="270" r="4" />
          <circle cx="540" cy="167" r="4" /><circle cx="234" cy="133" r="4" /><circle cx="422" cy="31" r="4" />
        </g>
      </svg>
      <div className={styles.sceneCaption}><span /><span>ÁPICE 360</span><span>LIGHT STEEL FRAME</span></div>
    </div>
  );
}

export function MaintenancePage({ locale, whatsappUrl, phone }: MaintenancePageProps) {
  const dict = getDictionary(locale);
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Logo className="h-14" />
        <span className={styles.status}><span />{dict.maintenance.eyebrow}</span>
      </header>
      <div className={styles.layout}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>ÁPICE 360 / LIGHT STEEL FRAME</span>
          <h1>{dict.maintenance.heading}</h1>
          <span className={styles.rule} />
          <p className={styles.body}>{dict.maintenance.body}</p>
          {whatsappUrl || phone ? (
            <div className={styles.contacts}>
              <p>{dict.maintenance.contact}</p>
              <div className={styles.actions}>
                {whatsappUrl ? (
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className={styles.primary}>
                    <MessageCircle size={19} aria-hidden="true" />WhatsApp<ArrowUpRight size={17} aria-hidden="true" />
                  </a>
                ) : null}
                {phone ? (
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className={styles.secondary}>
                    <Phone size={18} aria-hidden="true" />{phone}
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
        <SteelFrameIllustration />
      </div>
      <footer className={styles.footer}><span>Ápice 360</span><span>Light Steel Frame · Portugal</span></footer>
    </main>
  );
}
