"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

type Tab = { href: string; label: string; icon: string; badge?: number };

/**
 * Navegação do módulo de correio. Fica aqui e não na barra lateral porque
 * estas quatro vistas são o mesmo assunto — a lateral ficaria com quatro
 * linhas quase iguais.
 */
export function EmailTabs({ unread }: { unread: number }) {
  const pathname = usePathname();
  const params = useSearchParams();
  const pasta = params.get("pasta") ?? "entrada";

  const tabs: Tab[] = [
    { href: "/admin/email?pasta=entrada", label: "Caixa de entrada", icon: "inbox", badge: unread },
    { href: "/admin/email?pasta=enviados", label: "Enviados", icon: "send" },
    { href: "/admin/email?pasta=arquivo", label: "Arquivo", icon: "archive" },
    { href: "/admin/email/modelos", label: "Modelos", icon: "description" },
    { href: "/admin/email/contas", label: "Contas", icon: "alternate_email" },
  ];

  function isActive(href: string) {
    const [caminho, query] = href.split("?");
    if (caminho !== pathname) return pathname.startsWith(`${caminho}/`) && caminho !== "/admin/email";
    if (!query) return true;
    return query === `pasta=${pasta}`;
  }

  return (
    <nav className="mb-6 flex flex-wrap gap-2 border-b border-outline-variant/20 pb-3">
      {tabs.map((tab) => {
        const ativo = isActive(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-colors",
              ativo
                ? "bg-primary/10 font-bold text-primary"
                : "text-on-surface-variant hover:bg-surface-container-high",
            )}
          >
            <Icon name={tab.icon} className="text-lg" />
            {tab.label}
            {tab.badge ? (
              <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-bold text-on-primary">
                {tab.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
