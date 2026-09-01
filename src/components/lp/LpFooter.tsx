import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";

type LpFooterProps = {
  locale: SiteLocale;
  description: string;
  address?: string | null;
  phone?: string | null;
  nif?: string | null;
  instagramUrl?: string | null;
  whatsappUrl?: string | null;
};

/**
 * Rodapé próprio da landing page: contactos e âncoras dentro da própria
 * página, sem a navegação completa do site (a única porta para fora é o
 * link discreto "ver o site completo"). Mantém o registo escuro do rodapé
 * institucional para as duas páginas parecerem da mesma casa.
 */
export function LpFooter({
  locale,
  description,
  address,
  phone,
  nif,
  instagramUrl,
  whatsappUrl,
}: LpFooterProps) {
  const dict = getDictionary(locale);
  const t = dict.lp.footer;
  const year = new Date().getFullYear();

  const socials = [
    { href: instagramUrl, icon: "photo_camera", label: "Instagram" },
    { href: whatsappUrl, icon: "chat", label: "WhatsApp" },
  ].filter((s): s is { href: string; icon: string; label: string } => Boolean(s.href));

  return (
    <footer className="relative z-20 border-t border-white/10 bg-ink pb-40 pt-20 text-gray-300 sm:pb-24">
      <div className="mx-auto max-w-site px-5 md:px-20">
        <div className="flex flex-col justify-between gap-16 md:flex-row">
          <div className="max-w-sm">
            <Logo variant="light" className="mb-8 h-12" />
            <p className="mb-8 leading-relaxed">{description}</p>

            <div className="mb-8 space-y-3 text-sm">
              {address ? (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 transition-colors hover:text-primary"
                >
                  <Icon name="location_on" className="text-lg text-primary" />
                  {address}
                </a>
              ) : null}
              {phone ? (
                <a
                  href={`tel:${phone.replace(/\s+/g, "")}`}
                  className="flex items-center gap-3 transition-colors hover:text-primary"
                >
                  <Icon name="call" className="text-lg text-primary" />
                  {phone}
                </a>
              ) : null}
              {nif ? (
                <span className="flex items-center gap-3 text-gray-400">
                  <Icon name="badge" className="text-lg text-primary" />
                  NIF {nif}
                </span>
              ) : null}
            </div>

            {socials.length > 0 ? (
              <div className="flex gap-4">
                {socials.map((s) => (
                  <a
                    key={s.icon}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/20 transition-all hover:border-primary hover:bg-primary hover:text-white"
                  >
                    <Icon name={s.icon} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
            <div>
              <h5 className="mb-8 font-mono text-label-mono uppercase tracking-widest text-primary">
                {t.navegacao}
              </h5>
              <ul className="space-y-4">
                {[
                  { href: "#hero", label: t.inicio },
                  { href: "#benefits", label: t.vantagens },
                  { href: "#simulador", label: t.simulador },
                  { href: "#contact", label: t.contacto },
                ].map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="transition-colors hover:text-primary">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="mb-8 font-mono text-label-mono uppercase tracking-widest text-primary">
                {t.saibaMais}
              </h5>
              <ul className="space-y-4">
                <li>
                  <a href="#confianca" className="transition-colors hover:text-primary">
                    {t.sobreNos}
                  </a>
                </li>
                <li>
                  <Link href="/" className="transition-colors hover:text-primary">
                    {t.verSiteCompleto}
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <h5 className="mb-8 font-mono text-label-mono uppercase tracking-widest text-primary">{t.legal}</h5>
              <ul className="space-y-4">
                <li>
                  <Link href="/privacidade" className="transition-colors hover:text-primary">
                    {t.privacidade}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-10 font-mono text-xs uppercase tracking-widest md:flex-row">
          <span>{dict.footer.direitos(year)}</span>
          <span>{dict.footer.tagline}</span>
        </div>
      </div>
    </footer>
  );
}
