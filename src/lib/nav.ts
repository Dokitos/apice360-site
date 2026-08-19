import type { Dictionary } from "@/lib/dictionary";

export function getNavLinks(dict: Dictionary, options: { showArchitectArea?: boolean } = {}) {
  const links = [
    { href: "/", label: dict.nav.inicio },
    { href: "/quem-somos", label: dict.nav.quemSomos },
    { href: "/servicos", label: dict.nav.servicos },
    { href: "/portfolio", label: dict.nav.portfolio },
    { href: "/blog", label: dict.nav.blog },
    { href: "/contacto", label: dict.nav.contactos },
    { href: "/area-do-arquiteto", label: dict.nav.areaArquiteto },
  ];

  return options.showArchitectArea === false ? links.filter((link) => link.href !== "/area-do-arquiteto") : links;
}
