import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";

type MaintenancePageProps = {
  locale: SiteLocale;
  whatsappUrl?: string | null;
  phone?: string | null;
};

export function MaintenancePage({ locale, whatsappUrl, phone }: MaintenancePageProps) {
  const dict = getDictionary(locale);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-container-lowest px-5 text-center">
      <Logo className="mb-12" />

      <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Icon name="construction" className="animate-pulse-glow rounded-full text-4xl text-primary" />
      </div>

      <span className="mb-4 font-mono text-label-mono uppercase tracking-widest text-primary">
        {dict.maintenance.eyebrow}
      </span>
      <h1 className="mb-4 max-w-xl font-heading text-headline-lg">{dict.maintenance.heading}</h1>
      <p className="mb-10 max-w-md text-body-lg leading-relaxed text-on-surface-variant">{dict.maintenance.body}</p>

      {whatsappUrl || phone ? (
        <div className="flex flex-col items-center gap-3">
          <p className="text-sm text-on-surface-variant">{dict.maintenance.contact}</p>
          <div className="flex gap-3">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-primary transition-transform hover:scale-105"
              >
                <Icon name="chat" className="text-lg" />
                WhatsApp
              </a>
            ) : null}
            {phone ? (
              <a
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-2 rounded-full border border-outline-variant/40 px-6 py-3 text-sm font-bold uppercase tracking-wide text-on-surface transition-colors hover:bg-surface-container-high"
              >
                <Icon name="call" className="text-lg" />
                {phone}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
