import type { Dictionary } from "@/lib/dictionary";

export function getNavLinks(dict: Dictionary) {
  return [
    { href: "/", label: dict.nav.inicio },
    { href: "/quem-somos", label: dict.nav.quemSomos },
    { href: "/servicos", label: dict.nav.servicos },
    { href: "/portfolio", label: dict.nav.portfolio },
    { href: "/blog", label: dict.nav.blog },
    { href: "/contacto", label: dict.nav.contactos },
    { href: "/area-do-arquiteto", label: dict.nav.areaArquiteto },
  ] as const;
}
