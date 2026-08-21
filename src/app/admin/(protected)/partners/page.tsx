import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/ui/Icon";
import Link from "next/link";
import { deletePartner } from "./actions";

export default async function PartnersPage() {
  await requirePermission("partners", "view");
  const partners = await prisma.partner.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <AdminPageHeader
        title="Parceiros"
        description="Logos de gabinetes de arquitetura e parceiros exibidos na Home."
        newHref="/admin/partners/new"
        newLabel="Novo Parceiro"
      />
      <DataTable
        rows={partners}
        getRowId={(p) => p.id}
        emptyMessage="Ainda não há parceiros. Cria o primeiro."
        columns={[
          {
            header: "Logo",
            render: (p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.logoUrl} alt={p.name} className="h-10 w-10 rounded object-cover" />
            ),
          },
          { header: "Nome", render: (p) => <span className="font-bold">{p.name}</span> },
          { header: "Ordem", render: (p) => p.order },
          {
            header: "Estado",
            render: (p) => (
              <span className={p.isActive ? "text-primary" : "text-on-surface-variant"}>
                {p.isActive ? "Ativo" : "Inativo"}
              </span>
            ),
          },
        ]}
        renderActions={(p) => (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/partners/${p.id}/edit`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Icon name="edit" className="text-lg" />
            </Link>
            <DeleteButton action={deletePartner.bind(null, p.id)} />
          </div>
        )}
      />
    </div>
  );
}
