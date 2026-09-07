import type { Dictionary } from "@/lib/dictionary";

type NavCustomPage = { slug: string; navLabel: string };

export function getNavLinks(
  dict: Dictionary,
  options: { showArchitectArea?: boolean; showLsfPage?: boolean; customPages?: NavCustomPage[] } = {},
) {
  const links = [
    { href: "/", label: dict.nav.inicio },
    { href: "/quem-somos", label: dict.nav.quemSomos },
    { href: "/servicos", label: dict.nav.servicos },
    { href: "/lsf", label: dict.nav.lsf },
    { href: "/portfolio", label: dict.nav.portfolio },
    { href: "/blog", label: dict.nav.blog },
    { href: "/contacto", label: dict.nav.contactos },
    { href: "/area-do-arquiteto", label: dict.nav.areaArquiteto },
  ];

  // Cada página opcional sai da lista quando o respetivo interruptor das
  // Definições do Site está desligado — ver SiteSettings no admin.
  const fixedLinks = links.filter((link) => {
    if (link.href === "/area-do-arquiteto") return options.showArchitectArea !== false;
    if (link.href === "/lsf") return options.showLsfPage !== false;
    return true;
  });

  const customLinks = (options.customPages ?? []).map((page) => ({
    href: `/paginas/${page.slug}`,
    label: page.navLabel,
  }));

  return [...fixedLinks, ...customLinks];
}
