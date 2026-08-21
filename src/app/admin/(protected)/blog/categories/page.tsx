import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/ui/Icon";
import { deleteBlogCategory } from "./actions";

export default async function BlogCategoriesPage() {
  await requirePermission("blog_categories", "view");
  const categories = await prisma.blogCategory.findMany({
    orderBy: { order: "asc" },
    include: { translations: true },
  });

  return (
    <div>
      <AdminPageHeader
        title="Categorias de Blog"
        newHref="/admin/blog/categories/new"
        newLabel="Nova Categoria"
      />
      <DataTable
        rows={categories}
        getRowId={(c) => c.id}
        emptyMessage="Ainda não há categorias."
        columns={[
          {
            header: "Nome (PT)",
            render: (c) => <span className="font-bold">{c.translations.find((t) => t.locale === "PT")?.name ?? "—"}</span>,
          },
          {
            header: "Slug (PT)",
            render: (c) => <code className="text-xs text-on-surface-variant">{c.translations.find((t) => t.locale === "PT")?.slug ?? "—"}</code>,
          },
          { header: "Ordem", render: (c) => c.order },
        ]}
        renderActions={(c) => (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/blog/categories/${c.id}/edit`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Icon name="edit" className="text-lg" />
            </Link>
            <DeleteButton action={deleteBlogCategory.bind(null, c.id)} />
          </div>
        )}
      />
    </div>
  );
}
