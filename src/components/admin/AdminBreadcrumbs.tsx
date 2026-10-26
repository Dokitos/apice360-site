"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AdminIcon } from "./AdminIcon";

const navigable = new Set(["leads", "email", "portfolio", "services", "partners", "testimonials", "stats", "pages", "page-sections", "landing-page", "site-settings", "seo", "ctas", "users", "groups", "posts", "categories", "comments", "contas", "modelos", "newsletter"]);

const labels: Record<string, string> = {
  leads: "Contactos", email: "Correio", blog: "Blog", posts: "Artigos",
  categories: "Categorias", comments: "Comentários", portfolio: "Portfólio",
  services: "Serviços", partners: "Parceiros", testimonials: "Testemunhos",
  stats: "Estatísticas", pages: "Páginas", "page-sections": "Secções",
  "landing-page": "Landing page", "site-settings": "Definições", seo: "SEO",
  ctas: "Chamadas para ação", users: "Utilizadores", groups: "Grupos", logs: "Registo de atividade",
  new: "Novo", novo: "Novo", edit: "Editar", editar: "Editar", contas: "Contas",
  modelos: "Modelos", newsletter: "Newsletter", campos: "Campos", features: "Características",
};

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean).slice(1);
  return (
    <nav aria-label="Localização" className="min-w-0 text-sm">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <li><Link href="/admin" className="text-slate-500 hover:text-slate-900">Administração</Link></li>
        {segments.length === 0 ? <li className="flex items-center gap-2"><AdminIcon name="chevron_right" className="text-sm text-slate-300" /><span aria-current="page" className="font-medium text-slate-800">Resumo</span></li> : segments.map((segment, i) => (
          <li key={`${i}-${segment}`} className="flex items-center gap-2">
            <AdminIcon name="chevron_right" className="text-sm text-slate-300" />
            {i === segments.length - 1 || !navigable.has(segment) ? <span aria-current={i === segments.length - 1 ? "page" : undefined} className="font-medium text-slate-800">{labels[segment] ?? "Detalhes"}</span> : <Link href={`/admin/${segments.slice(0, i + 1).join("/")}`} className="text-slate-500 hover:text-slate-900">{labels[segment] ?? "Detalhes"}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
