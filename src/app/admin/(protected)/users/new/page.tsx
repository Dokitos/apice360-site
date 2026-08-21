import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { UserForm } from "@/components/admin/UserForm";
import { createUser } from "../actions";

export default async function NewUserPage() {
  const groups = await prisma.group.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <div>
      <AdminPageHeader title="Novo Utilizador" />
      <UserForm groups={groups} action={createUser} />
    </div>
  );
}
