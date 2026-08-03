"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "Geral",
    items: [
      { href: "/admin", label: "Dashboard", icon: "dashboard" },
      { href: "/admin/site-settings", label: "Definições do Site", icon: "settings" },
      { href: "/admin/ctas", label: "CTAs", icon: "bolt" },
      { href: "/admin/seo", label: "SEO por Página", icon: "search" },
    ],
  },
  {
    title: "Conteúdo",
    items: [
      { href: "/admin/page-sections", label: "Secções de Página", icon: "dashboard_customize" },
      { href: "/admin/partners", label: "Parceiros", icon: "handshake" },
      { href: "/admin/testimonials", label: "Testemunhos", icon: "format_quote" },
      { href: "/admin/stats", label: "Estatísticas", icon: "monitoring" },
      { href: "/admin/services", label: "Serviços", icon: "engineering" },
      { href: "/admin/portfolio", label: "Portfólio", icon: "photo_library" },
    ],
  },
  {
    title: "Blog",
    items: [
      { href: "/admin/blog/posts", label: "Artigos", icon: "article" },
      { href: "/admin/blog/categories", label: "Categorias", icon: "sell" },
      { href: "/admin/blog/comments", label: "Comentários", icon: "forum" },
    ],
  },
  {
    title: "Operação",
    items: [
      { href: "/admin/leads", label: "Leads", icon: "contact_mail" },
      { href: "/admin/users", label: "Utilizadores", icon: "manage_accounts", adminOnly: true },
    ],
  },
];

export function AdminSidebar({ role }: { role: "ADMIN" | "EDITOR" }) {
  const pathname = usePathname();

  return (
    <nav className="flex h-full w-64 shrink-0 flex-col gap-8 overflow-y-auto border-r border-outline-variant/20 bg-surface-container-lowest p-6">
      <Link href="/admin" className="mb-2 flex items-center gap-2">
        <span className="font-heading text-headline-md text-primary tracking-tighter">
          ÁPICE 360
        </span>
      </Link>

      {navGroups.map((group) => {
        const visibleItems = group.items.filter((item) => !item.adminOnly || role === "ADMIN");
        if (visibleItems.length === 0) return null;

        return (
          <div key={group.title} className="flex flex-col gap-1">
            <span className="mb-2 px-3 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant/70">
              {group.title}
            </span>
            {visibleItems.map((item) => {
              const isActive =
                item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface",
                  )}
                >
                  <Icon name={item.icon} className="text-xl" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        );
      })}
    </nav>
  );
}
