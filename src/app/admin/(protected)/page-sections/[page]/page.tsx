import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/ui/Icon";
import { deletePageSection } from "../actions";

const VALID_PAGES = ["HOME", "QUEM_SOMOS", "SERVICOS", "CONTACTO", "AREA_ARQUITETO"] as const;

export default async function PageSectionsListPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  if (!VALID_PAGES.includes(page as (typeof VALID_PAGES)[number])) notFound();
  const pageKey = page as (typeof VALID_PAGES)[number];

  const sections = await prisma.pageSection.findMany({
    where: { page: pageKey },
    orderBy: { order: "asc" },
    include: { translations: true },
  });

  return (
    <div>
      <AdminPageHeader
        title={`Secções: ${pageKey}`}
        newHref={`/admin/page-sections/${pageKey}/new`}
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
              href={`/admin/page-sections/${pageKey}/${s.id}/edit`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Icon name="edit" className="text-lg" />
            </Link>
            <DeleteButton action={deletePageSection.bind(null, pageKey, s.id)} />
          </div>
        )}
      />
    </div>
  );
}
