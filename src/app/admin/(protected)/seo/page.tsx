import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";

const PAGES = [
  { key: "HOME", label: "Home" },
  { key: "QUEM_SOMOS", label: "Quem Somos" },
  { key: "SERVICOS", label: "Serviços" },
  { key: "PORTFOLIO", label: "Portfólio" },
  { key: "BLOG", label: "Blog" },
  { key: "CONTACTO", label: "Contacto" },
  { key: "AREA_ARQUITETO", label: "Área do Arquiteto" },
] as const;

export default async function SeoPage() {
  const entries = await prisma.pageSeo.findMany({ include: { translations: true } });

  const rows = PAGES.map((p) => {
    const entry = entries.find((e) => e.page === p.key);
    return {
      key: p.key,
      label: p.label,
      title: entry?.translations.find((t) => t.locale === "PT")?.title,
      configured: Boolean(entry),
    };
  });

  return (
    <div>
      <AdminPageHeader title="SEO por Página" description="Título e descrição usados nos motores de busca e partilhas." />
      <DataTable
        rows={rows}
        getRowId={(r) => r.key}
        columns={[
          { header: "Página", render: (r) => <span className="font-bold">{r.label}</span> },
          { header: "Título SEO (PT)", render: (r) => r.title ?? "Não configurado" },
          {
            header: "Estado",
            render: (r) => (
              <span className={r.configured ? "text-primary" : "text-on-surface-variant"}>
                {r.configured ? "Configurado" : "Pendente"}
              </span>
            ),
          },
        ]}
        renderActions={(r) => (
          <Link
            href={`/admin/seo/${r.key}`}
            className="text-sm font-bold uppercase text-primary hover:underline"
          >
            {r.configured ? "Editar" : "Configurar"}
          </Link>
        )}
      />
    </div>
  );
}
