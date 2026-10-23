"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import type { Resource } from "@/lib/resources";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
  resource?: Resource;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const COLLAPSE_KEY = "apice-admin-menu-recolhido";

/**
 * O estado do menu vive no armazenamento do browser, não no React.
 *
 * Lido com useSyncExternalStore e não com um efeito: no servidor não há
 * localStorage, e ler num efeito significava desenhar sempre o menu aberto
 * e corrigi-lo a seguir — um salto visível a cada navegação.
 */
const ouvintes = new Set<() => void>();

function subscreverRecolhido(aoMudar: () => void) {
  ouvintes.add(aoMudar);
  return () => {
    ouvintes.delete(aoMudar);
  };
}

function lerRecolhido() {
  try {
    return window.localStorage.getItem(COLLAPSE_KEY) === "1";
  } catch {
    // Modo privado ou armazenamento bloqueado: fica aberto, como sempre esteve.
    return false;
  }
}

function guardarRecolhido(valor: boolean) {
  try {
    window.localStorage.setItem(COLLAPSE_KEY, valor ? "1" : "0");
  } catch {
    // Sem armazenamento a escolha não sobrevive ao recarregar.
  }
  for (const aoMudar of ouvintes) aoMudar();
}

const navGroups: NavGroup[] = [
  {
    title: "Geral",
    items: [
      { href: "/admin", label: "Dashboard", icon: "dashboard" },
      { href: "/admin/site-settings", label: "Definições do Site", icon: "settings", resource: "site_settings" },
      { href: "/admin/ctas", label: "CTAs", icon: "bolt", resource: "ctas" },
      { href: "/admin/seo", label: "SEO por Página", icon: "search", resource: "seo" },
    ],
  },
  {
    title: "Conteúdo",
    items: [
      { href: "/admin/page-sections", label: "Secções de Página", icon: "dashboard_customize", resource: "page_sections" },
      { href: "/admin/pages", label: "Páginas Personalizadas", icon: "note_add", resource: "custom_pages" },
      { href: "/admin/landing-page", label: "Landing Page (/lp)", icon: "ads_click", resource: "landing_page" },
      { href: "/admin/partners", label: "Parceiros", icon: "handshake", resource: "partners" },
      { href: "/admin/testimonials", label: "Testemunhos", icon: "format_quote", resource: "testimonials" },
      { href: "/admin/stats", label: "Estatísticas", icon: "monitoring", resource: "stats" },
      { href: "/admin/services", label: "Serviços", icon: "engineering", resource: "services" },
      { href: "/admin/portfolio", label: "Portfólio", icon: "photo_library", resource: "portfolio" },
    ],
  },
  {
    title: "Blog",
    items: [
      { href: "/admin/blog/posts", label: "Artigos", icon: "article", resource: "blog_posts" },
      { href: "/admin/blog/categories", label: "Categorias", icon: "sell", resource: "blog_categories" },
      { href: "/admin/blog/comments", label: "Comentários", icon: "forum", resource: "blog_comments" },
    ],
  },
  {
    title: "Operação",
    items: [
      { href: "/admin/email", label: "Caixa de Correio", icon: "mail", resource: "email" },
      { href: "/admin/leads", label: "Leads", icon: "contact_mail", resource: "leads" },
      { href: "/admin/users", label: "Utilizadores", icon: "manage_accounts", adminOnly: true },
      { href: "/admin/groups", label: "Grupos", icon: "shield_person", adminOnly: true },
    ],
  },
];

export function AdminSidebar({
  role,
  viewableResources,
}: {
  role: "ADMIN" | "EDITOR";
  /** null = every resource visible (ADMIN or an EDITOR with no group assigned). */
  viewableResources: string[] | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  // Em ecrã largo o menu pode encolher para só ícones, para o conteúdo ficar
  // com a largura toda. A escolha é de quem usa e fica guardada no browser.
  const collapsed = useSyncExternalStore(subscreverRecolhido, lerRecolhido, () => false);

  // Auto-close the mobile drawer whenever navigation happens.
  useEffect(() => {
    function closeDrawer() {
      setOpen(false);
    }
    closeDrawer();
  }, [pathname]);

  function toggleCollapsed() {
    guardarRecolhido(!collapsed);
  }

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
        onClick={() => setOpen((v) => !v)}
        className="fixed left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant/40 bg-surface-container-lowest text-on-surface shadow-lg lg:hidden"
      >
        <Icon name={open ? "close" : "menu"} className="text-2xl" />
      </button>

      {open ? (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/50 lg:hidden"
          aria-hidden="true"
        />
      ) : null}

      <nav
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full w-72 shrink-0 flex-col gap-8 overflow-y-auto border-r border-outline-variant/20 bg-surface-container-lowest p-6 transition-all duration-300 lg:sticky lg:top-0 lg:z-auto lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:w-20 lg:px-3" : "lg:w-64",
        )}
      >
        <div className="mb-2 flex items-center justify-between gap-2 pl-12 lg:pl-0">
          <Link href="/admin" className={cn("flex items-center gap-2", collapsed && "lg:hidden")}>
            <Logo className="h-10" />
          </Link>
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label={collapsed ? "Mostrar o menu" : "Esconder o menu"}
            title={collapsed ? "Mostrar o menu" : "Esconder o menu"}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-primary lg:flex"
          >
            <Icon name={collapsed ? "chevron_right" : "chevron_left"} className="text-xl" />
          </button>
        </div>

        {navGroups.map((group) => {
          const visibleItems = group.items.filter((item) => {
            if (item.adminOnly) return role === "ADMIN";
            if (item.resource && viewableResources) return viewableResources.includes(item.resource);
            return true;
          });
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="flex flex-col gap-1">
              <span
                className={cn(
                  "mb-2 px-3 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant/70",
                  collapsed && "lg:hidden",
                )}
              >
                {group.title}
              </span>
              {visibleItems.map((item) => {
                const isActive =
                  item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    // O título só serve de rótulo quando o menu está
                    // encolhido e o nome deixou de estar à vista.
                    title={collapsed ? item.label : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                      collapsed && "lg:justify-center lg:px-0",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                    )}
                  >
                    <Icon name={item.icon} className="text-xl" />
                    <span className={cn(collapsed && "lg:hidden")}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </>
  );
}
