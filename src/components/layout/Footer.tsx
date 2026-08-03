import Link from "next/link";
import { getSiteSettings } from "@/lib/content";
import { NAV_LINKS } from "@/lib/nav";
import { Icon } from "@/components/ui/Icon";

const SERVICE_LINKS = [
  { href: "/servicos#lsf", label: "LSF" },
  { href: "/servicos#remodelacao", label: "Remodelação" },
  { href: "/contacto", label: "Trabalhe Connosco" },
  { href: "/area-do-arquiteto", label: "Área dos Arquitetos" },
  { href: "/contacto", label: "Orçamento" },
];

export async function Footer() {
  const settings = await getSiteSettings();
  const year = new Date().getFullYear();

  const socials = [
    { href: settings?.socialFacebook, icon: "share" },
    { href: settings?.socialInstagram, icon: "photo_camera" },
    { href: settings?.socialLinkedin, icon: "work" },
    { href: settings?.socialYoutube, icon: "smart_display" },
  ].filter((s) => s.href);

  return (
    <footer className="border-t border-outline-variant/20 bg-surface-container-lowest py-20">
      <div className="mx-auto max-w-[1280px] px-5 md:px-20">
        <div className="flex flex-col justify-between gap-16 md:flex-row">
          <div className="max-w-sm">
            <div className="mb-8 flex items-center gap-2">
              <span className="font-heading text-headline-md font-bold tracking-tighter text-on-surface">
                ÁPICE 360
              </span>
            </div>
            <p className="mb-8 leading-relaxed text-on-surface-variant">
              {settings?.t?.footerDescription ??
                "Referência em tecnologia Light Steel Frame em Portugal. Engenharia de alta performance para construções duráveis e sustentáveis."}
            </p>
            {socials.length > 0 ? (
              <div className="flex gap-4">
                {socials.map((s) => (
                  <a
                    key={s.icon}
                    href={s.href ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-12 w-12 items-center justify-center rounded-lg border border-outline-variant transition-all hover:border-primary hover:bg-primary hover:text-on-primary"
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
                Navegação
              </h5>
              <ul className="space-y-4 text-on-surface-variant">
                {NAV_LINKS.map((link) => (
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
                Serviços
              </h5>
              <ul className="space-y-4 text-on-surface-variant">
                {SERVICE_LINKS.map((link, i) => (
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
                Contacto & Suporte
              </h5>
              <ul className="space-y-4 text-on-surface-variant">
                {settings?.addressLine ? (
                  <li>
                    {settings.addressLine}
                    {settings.addressCity ? `, ${settings.addressCity}` : ""}
                  </li>
                ) : null}
                {settings?.phone ? <li>{settings.phone}</li> : null}
                {settings?.email ? <li>{settings.email}</li> : null}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-outline-variant/10 pt-10 font-mono text-xs uppercase tracking-widest text-on-surface-variant md:flex-row">
          <span>© {year} Ápice 360 LSF Construction.</span>
          <span>Engineered for Precision &amp; Speed.</span>
        </div>
      </div>
    </footer>
  );
}
