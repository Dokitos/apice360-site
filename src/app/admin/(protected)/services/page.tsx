import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { deleteService } from "./actions";

export default async function ServicesPage() {
  await requirePermission("services", "view");
  const services = await prisma.service.findMany({
    orderBy: { order: "asc" },
    include: { translations: true },
  });

  return (
    <div>
      <AdminPageHeader
        title="Serviços"
        description="Linhas de serviço mostradas na página de Serviços do site."
        newHref="/admin/services/new"
        newLabel="Novo Serviço"
      />
      <DataTable
        rows={services}
        getRowId={(s) => s.id}
        emptyMessage="Ainda não há serviços."
        columns={[
          { header: "Identificador", render: (s) => s.type },
          {
            header: "Título (PT)",
            render: (s) => s.translations.find((t) => t.locale === "PT")?.title ?? "—",
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
              href={`/admin/services/${s.type}/edit`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Icon name="edit" className="text-lg" />
            </Link>
            <DeleteButton action={deleteService.bind(null, s.id)} />
          </div>
        )}
      />
    </div>
  );
}
