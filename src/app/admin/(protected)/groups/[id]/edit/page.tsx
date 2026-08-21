import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { GroupForm } from "@/components/admin/GroupForm";
import { updateGroup } from "../../actions";

export default async function EditGroupPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const group = await prisma.group.findUnique({ where: { id }, include: { permissions: true } });
  if (!group) notFound();

  return (
    <div>
      <AdminPageHeader title="Editar Grupo" />
      <GroupForm group={group} action={updateGroup.bind(null, id)} />
    </div>
  );
}
