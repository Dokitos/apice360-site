import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PageSectionForm } from "@/components/admin/PageSectionForm";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/ui/Icon";
import { updatePageSection, deletePageSectionItem } from "../../../actions";

const VALID_PAGES = ["HOME", "QUEM_SOMOS", "SERVICOS", "CONTACTO", "AREA_ARQUITETO"] as const;

export default async function EditPageSectionPage({
  params,
}: {
  params: Promise<{ page: string; sectionId: string }>;
}) {
  const { page, sectionId } = await params;
  if (!VALID_PAGES.includes(page as (typeof VALID_PAGES)[number])) notFound();
  const pageKey = page as (typeof VALID_PAGES)[number];

  const section = await prisma.pageSection.findUnique({
    where: { id: sectionId },
    include: {
      translations: true,
      items: { orderBy: { order: "asc" }, include: { translations: true } },
    },
  });
  if (!section) notFound();

  return (
    <div>
      <AdminPageHeader title={`Secção: ${section.key}`} />
      <PageSectionForm section={section} action={updatePageSection.bind(null, pageKey, sectionId)} />

      <div className="mt-16 max-w-2xl">
        <AdminPageHeader
          title="Itens"
          description="Elementos repetíveis desta secção (bullets, pilares, valores, etc.)."
          newHref={`/admin/page-sections/${pageKey}/${sectionId}/items/new`}
          newLabel="Novo Item"
        />
        <DataTable
          rows={section.items}
          getRowId={(i) => i.id}
          emptyMessage="Ainda não há itens."
          columns={[
            {
              header: "Título (PT)",
              render: (i) => i.translations.find((t) => t.locale === "PT")?.title ?? "—",
            },
            { header: "Ordem", render: (i) => i.order },
          ]}
          renderActions={(i) => (
            <div className="flex items-center justify-end gap-2">
              <Link
                href={`/admin/page-sections/${pageKey}/${sectionId}/items/${i.id}/edit`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Icon name="edit" className="text-lg" />
              </Link>
              <DeleteButton action={deletePageSectionItem.bind(null, pageKey, sectionId, i.id)} />
            </div>
          )}
        />
      </div>
    </div>
  );
}
