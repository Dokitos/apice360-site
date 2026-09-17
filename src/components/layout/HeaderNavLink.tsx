"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

/**
 * Link do menu principal. Só muda de cor — o efeito de baralhar as letras
 * saiu a pedido do cliente. A página onde o visitante está fica laranja de
 * forma fixa, para o menu dizer sempre onde ele se encontra.
 */
export function HeaderNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();

  // "/" tem de ser exacto, senão ficava activo em todas as páginas. Nas
  // restantes basta o prefixo, para /blog continuar activo dentro de um
  // artigo. Uma âncora como "/servicos#lsf" compara-se sem o fragmento.
  const path = href.split("#")[0] || "/";
  const isActive = path === "/" ? pathname === "/" : pathname === path || pathname.startsWith(`${path}/`);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "whitespace-nowrap text-[15px] font-medium uppercase tracking-wide transition-colors duration-300",
        isActive ? "text-primary" : "text-on-surface-variant hover:text-primary",
      )}
    >
      {label}
    </Link>
  );
}
