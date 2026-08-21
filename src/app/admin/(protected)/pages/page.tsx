import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/ui/Icon";
import { deleteCustomPage } from "./actions";

export default async function CustomPagesPage() {
  await requirePermission("custom_pages", "view");
  const pages = await prisma.customPage.findMany({
    orderBy: { order: "asc" },
    include: { translations: true },
  });

  return (
    <div>
      <AdminPageHeader
        title="Páginas Personalizadas"
        description="Páginas criadas por ti, fora das páginas fixas do site. Ficam acessíveis em /paginas/<slug> e, opcionalmente, no menu."
        newHref="/admin/pages/new"
        newLabel="Nova Página"
      />
      <DataTable
        rows={pages}
        getRowId={(p) => p.id}
        emptyMessage="Ainda não há páginas personalizadas."
        columns={[
          {
            header: "Texto no Menu (PT)",
            render: (p) => p.translations.find((t) => t.locale === "PT")?.navLabel ?? "—",
          },
          { header: "Slug", render: (p) => `/paginas/${p.slug}` },
          {
            header: "No Menu",
            render: (p) => (p.showInMenu ? "Sim" : "Não"),
          },
          {
            header: "Estado",
            render: (p) => (
              <span className={p.isPublished ? "text-primary" : "text-on-surface-variant"}>
                {p.isPublished ? "Publicada" : "Rascunho"}
              </span>
            ),
          },
        ]}
        renderActions={(p) => (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/pages/${p.id}/edit`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Icon name="edit" className="text-lg" />
            </Link>
            <DeleteButton action={deleteCustomPage.bind(null, p.id)} />
          </div>
        )}
      />
    </div>
  );
}
