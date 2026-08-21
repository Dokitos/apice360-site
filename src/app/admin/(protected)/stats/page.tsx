import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/ui/Icon";
import { deleteStat } from "./actions";

export default async function StatsPage() {
  await requirePermission("stats", "view");
  const stats = await prisma.stat.findMany({
    orderBy: { order: "asc" },
    include: { translations: true },
  });

  return (
    <div>
      <AdminPageHeader
        title="Estatísticas"
        description="Números de destaque exibidos na Home (obras realizadas, m² construídos, etc.)."
        newHref="/admin/stats/new"
        newLabel="Nova Estatística"
      />
      <DataTable
        rows={stats}
        getRowId={(s) => s.id}
        emptyMessage="Ainda não há estatísticas."
        columns={[
          { header: "Valor", render: (s) => <span className="font-bold text-primary">{s.value}</span> },
          {
            header: "Rótulo (PT)",
            render: (s) => s.translations.find((t) => t.locale === "PT")?.label ?? "—",
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
              href={`/admin/stats/${s.id}/edit`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Icon name="edit" className="text-lg" />
            </Link>
            <DeleteButton action={deleteStat.bind(null, s.id)} />
          </div>
        )}
      />
    </div>
  );
}
