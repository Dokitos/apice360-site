import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CustomPageForm } from "@/components/admin/CustomPageForm";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/ui/Icon";
import { updateCustomPage } from "../../actions";
import { deleteCustomPageSection } from "../../../page-sections/actions";

export default async function EditCustomPagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [page, sections] = await Promise.all([
    prisma.customPage.findUnique({ where: { id }, include: { translations: true } }),
    prisma.pageSection.findMany({
      where: { customPageId: id },
      orderBy: { order: "asc" },
      include: { translations: true },
    }),
  ]);
  if (!page) notFound();

  return (
    <div>
      <AdminPageHeader title={`Página: ${page.translations.find((t) => t.locale === "PT")?.navLabel ?? page.slug}`} />
      <CustomPageForm page={page} action={updateCustomPage.bind(null, id)} />

      <div className="mt-16 max-w-2xl">
        <AdminPageHeader
          title="Secções"
          description="Blocos de conteúdo desta página, na ordem em que aparecem."
          newHref={`/admin/pages/${id}/sections/new`}
          newLabel="Nova Secção"
        />
        <DataTable
          rows={sections}
          getRowId={(s) => s.id}
          emptyMessage="Ainda não há secções configuradas para esta página."
          columns={[
            { header: "Chave", render: (s) => <code className="text-xs text-on-surface-variant">{s.key}</code> },
            {
              header: "Título (PT)",
              render: (s) => s.translations.find((t) => t.locale === "PT")?.heading ?? "—",
            },
            { header: "Ordem", render: (s) => s.order },
            {
              header: "Estado",
              render: (s) => (
                <span className={s.isActive ? "text-primary" : "text-on-surface-variant"}>
                  {s.isActive ? "Ativo" : "Inativo"}
                </span>
              ),
            },
          ]}
          renderActions={(s) => (
            <div className="flex items-center justify-end gap-2">
              <Link
                href={`/admin/pages/${id}/sections/${s.id}/edit`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Icon name="edit" className="text-lg" />
              </Link>
              <DeleteButton action={deleteCustomPageSection.bind(null, id, s.id)} />
            </div>
          )}
        />
      </div>
    </div>
  );
}
