import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/ui/Icon";
import { deleteGroup } from "./actions";

export default async function GroupsPage() {
  const groups = await prisma.group.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { users: true, permissions: true } } },
  });

  return (
    <div>
      <AdminPageHeader
        title="Grupos de Permissões"
        description="Restringe editores a apenas algumas áreas do painel. Um editor sem grupo continua a ter acesso total."
        newHref="/admin/groups/new"
        newLabel="Novo Grupo"
      />
      <DataTable
        rows={groups}
        getRowId={(g) => g.id}
        columns={[
          { header: "Nome", render: (g) => <span className="font-bold">{g.name}</span> },
          { header: "Áreas com Permissões", render: (g) => g._count.permissions },
          { header: "Utilizadores", render: (g) => g._count.users },
        ]}
        renderActions={(g) => (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/groups/${g.id}/edit`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Icon name="edit" className="text-lg" />
            </Link>
            {!g.isSystem ? <DeleteButton action={deleteGroup.bind(null, g.id)} /> : null}
          </div>
        )}
      />
    </div>
  );
}
