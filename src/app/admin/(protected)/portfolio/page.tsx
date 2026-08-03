import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/ui/Icon";
import { deleteProject } from "./actions";

export default async function PortfolioPage() {
  const projects = await prisma.portfolioProject.findMany({
    orderBy: { order: "asc" },
    include: { translations: true },
  });

  return (
    <div>
      <AdminPageHeader
        title="Portfólio"
        description="Projetos exibidos na página de Portfólio e nas respetivas páginas de detalhe."
        newHref="/admin/portfolio/new"
        newLabel="Novo Projeto"
      />
      <DataTable
        rows={projects}
        getRowId={(p) => p.id}
        emptyMessage="Ainda não há projetos no portfólio."
        columns={[
          {
            header: "Título (PT)",
            render: (p) => <span className="font-bold">{p.translations.find((t) => t.locale === "PT")?.title ?? "—"}</span>,
          },
          { header: "Categoria", render: (p) => (p.category === "LSF" ? "LSF" : "Remodelação") },
          { header: "Destaque", render: (p) => (p.isFeatured ? "Sim" : "Não") },
          {
            header: "Estado",
            render: (p) => (
              <span className={p.isPublished ? "text-primary" : "text-on-surface-variant"}>
                {p.isPublished ? "Publicado" : "Rascunho"}
              </span>
            ),
          },
        ]}
        renderActions={(p) => (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/portfolio/${p.id}/edit`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Icon name="edit" className="text-lg" />
            </Link>
            <DeleteButton action={deleteProject.bind(null, p.id)} />
          </div>
        )}
      />
    </div>
  );
}
