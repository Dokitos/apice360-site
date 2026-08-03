import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/ui/Icon";
import { deleteUser } from "./actions";

export default async function UsersPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div>
      <AdminPageHeader
        title="Utilizadores"
        description="Contas com acesso ao painel de administração."
        newHref="/admin/users/new"
        newLabel="Novo Utilizador"
      />
      <DataTable
        rows={users}
        getRowId={(u) => u.id}
        columns={[
          { header: "Nome", render: (u) => <span className="font-bold">{u.name}</span> },
          { header: "Email", render: (u) => u.email },
          { header: "Papel", render: (u) => (u.role === "ADMIN" ? "Administrador" : "Editor") },
          {
            header: "Estado",
            render: (u) => (
              <span className={u.isActive ? "text-primary" : "text-on-surface-variant"}>
                {u.isActive ? "Ativo" : "Inativo"}
              </span>
            ),
          },
        ]}
        renderActions={(u) => (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/users/${u.id}/edit`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Icon name="edit" className="text-lg" />
            </Link>
            <DeleteButton action={deleteUser.bind(null, u.id)} />
          </div>
        )}
      />
    </div>
  );
}
