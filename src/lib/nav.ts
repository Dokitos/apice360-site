import type { Dictionary } from "@/lib/dictionary";

type NavCustomPage = { slug: string; navLabel: string };

export function getNavLinks(
  dict: Dictionary,
  options: { showArchitectArea?: boolean; customPages?: NavCustomPage[] } = {},
) {
  const links = [
    { href: "/", label: dict.nav.inicio },
    { href: "/quem-somos", label: dict.nav.quemSomos },
    { href: "/servicos", label: dict.nav.servicos },
    { href: "/portfolio", label: dict.nav.portfolio },
    { href: "/blog", label: dict.nav.blog },
    { href: "/contacto", label: dict.nav.contactos },
    { href: "/area-do-arquiteto", label: dict.nav.areaArquiteto },
  ];

  const fixedLinks =
    options.showArchitectArea === false ? links.filter((link) => link.href !== "/area-do-arquiteto") : links;

  const customLinks = (options.customPages ?? []).map((page) => ({
    href: `/paginas/${page.slug}`,
    label: page.navLabel,
  }));

  return [...fixedLinks, ...customLinks];
}
