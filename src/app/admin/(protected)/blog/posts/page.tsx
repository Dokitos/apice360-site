import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/ui/Icon";
import { deleteBlogPost } from "./actions";

export default async function BlogPostsPage() {
  await requirePermission("blog_posts", "view");
  const posts = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    include: { translations: true, author: true, category: { include: { translations: true } } },
  });

  return (
    <div>
      <AdminPageHeader
        title="Artigos"
        description="Artigos do Blog Ápice 360."
        newHref="/admin/blog/posts/new"
        newLabel="Novo Artigo"
      />
      <DataTable
        rows={posts}
        getRowId={(p) => p.id}
        emptyMessage="Ainda não há artigos."
        columns={[
          {
            header: "Título (PT)",
            render: (p) => <span className="font-bold">{p.translations.find((t) => t.locale === "PT")?.title ?? "—"}</span>,
          },
          {
            header: "Categoria",
            render: (p) => p.category?.translations.find((t) => t.locale === "PT")?.name ?? "—",
          },
          { header: "Autor", render: (p) => p.author?.name ?? "—" },
          {
            header: "Estado",
            render: (p) => (
              <span className={p.status === "PUBLISHED" ? "text-primary" : "text-on-surface-variant"}>
                {p.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
              </span>
            ),
          },
        ]}
        renderActions={(p) => (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/blog/posts/${p.id}/edit`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Icon name="edit" className="text-lg" />
            </Link>
            <DeleteButton action={deleteBlogPost.bind(null, p.id)} />
          </div>
        )}
      />
    </div>
  );
}
