import Link from "next/link";
import { getSiteSettings } from "@/lib/content";
import { getNavLinks } from "@/lib/nav";
import { getLocale } from "@/lib/locale";
import { getDictionary } from "@/lib/dictionary";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";

export async function Footer() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const settings = await getSiteSettings(locale);
  const year = new Date().getFullYear();
  const navLinks = getNavLinks(dict);

  const serviceLinks = [
    { href: "/servicos#lsf", label: dict.footer.lsf },
    { href: "/contacto", label: dict.footer.trabalheConnosco },
    { href: "/area-do-arquiteto", label: dict.footer.areaDosArquitetos },
    { href: "/contacto", label: dict.footer.orcamento },
  ];

  const socials = [
    { href: settings?.socialInstagram, icon: "photo_camera", label: "Instagram" },
    { href: settings?.whatsappGeneral, icon: "chat", label: "WhatsApp" },
    { href: settings?.socialFacebook, icon: "share", label: "Facebook" },
    { href: settings?.socialLinkedin, icon: "work", label: "LinkedIn" },
  ].filter((s): s is { href: string; icon: string; label: string } => Boolean(s.href));

  const address = [settings?.addressLine, settings?.addressCity].filter(Boolean).join(", ");

  return (
    // Deliberately dark ("ink") regardless of the site's light theme —
    // bookends the page the same way the hero photo's dark scrim does.
    <footer className="border-t border-white/10 bg-ink pb-24 pt-20 text-gray-300 sm:pb-14">
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <div className="flex flex-col justify-between gap-16 md:flex-row">
          <div className="max-w-sm">
            <Link href="/" className="mb-8 inline-block">
              <Logo wordmarkClassName="text-white" />
            </Link>
            <p className="mb-8 leading-relaxed">
              {settings?.t?.footerDescription ?? dict.footer.descricaoDefault}
            </p>
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
              {settings?.phone ? (
                <a href={`tel:${settings.phone.replace(/\s+/g, "")}`} className="flex items-center gap-3 transition-colors hover:text-primary">
                  <Icon name="call" className="text-lg text-primary" />
                  {settings.phone}
                </a>
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
                {dict.footer.navegacao}
              </h5>
              <ul className="space-y-4">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h5 className="mb-8 font-mono text-label-mono uppercase tracking-widest text-primary">
                {dict.footer.servicos}
              </h5>
              <ul className="space-y-4">
                {serviceLinks.map((link, i) => (
                  <li key={`${link.href}-${i}`}>
                    <Link href={link.href} className="transition-colors hover:text-primary">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h5 className="mb-8 font-mono text-label-mono uppercase tracking-widest text-primary">
                {dict.footer.legal}
              </h5>
              <ul className="space-y-4">
                <li>
                  <Link href="/privacidade" className="transition-colors hover:text-primary">
                    {dict.footer.privacidade}
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
