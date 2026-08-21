"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { groupSchema } from "@/lib/validations/group";
import { RESOURCES } from "@/lib/resources";

function readPermissions(formData: FormData) {
  return RESOURCES.map((resource) => ({
    resource,
    canView: formData.get(`perm_${resource}_view`) === "on",
    canCreate: formData.get(`perm_${resource}_create`) === "on",
    canEdit: formData.get(`perm_${resource}_edit`) === "on",
    canDelete: formData.get(`perm_${resource}_delete`) === "on",
  })).filter((p) => p.canView || p.canCreate || p.canEdit || p.canDelete);
}

export async function createGroup(_prevState: string | undefined, formData: FormData) {
  await requireAdmin();
  const parsed = groupSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const existing = await prisma.group.findUnique({ where: { name: parsed.data.name } });
  if (existing) return "Já existe um grupo com este nome.";

  await prisma.group.create({
    data: {
      name: parsed.data.name,
      permissions: { create: readPermissions(formData) },
    },
  });

  revalidatePath("/admin/groups");
  redirect("/admin/groups?saved=1");
}

export async function updateGroup(id: string, _prevState: string | undefined, formData: FormData) {
  await requireAdmin();
  const parsed = groupSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const current = await prisma.group.findUnique({ where: { id } });
  if (!current) return "Grupo não encontrado.";

  if (!current.isSystem) {
    const existing = await prisma.group.findUnique({ where: { name: parsed.data.name } });
    if (existing && existing.id !== id) return "Já existe outro grupo com este nome.";
  }

  const permissions = readPermissions(formData);

  await prisma.$transaction([
    ...(current.isSystem ? [] : [prisma.group.update({ where: { id }, data: { name: parsed.data.name } })]),
    prisma.groupPermission.deleteMany({ where: { groupId: id } }),
    prisma.groupPermission.createMany({ data: permissions.map((p) => ({ ...p, groupId: id })) }),
  ]);

  revalidatePath("/admin/groups");
  redirect(`/admin/groups/${id}/edit?saved=1`);
}

export async function deleteGroup(id: string) {
  await requireAdmin();
  const group = await prisma.group.findUnique({ where: { id }, include: { _count: { select: { users: true } } } });
  if (!group) return;
  if (group.isSystem) {
    throw new Error("Não é possível eliminar um grupo do sistema.");
  }
  if (group._count.users > 0) {
    throw new Error("Não é possível eliminar um grupo com utilizadores atribuídos. Reatribui-os primeiro.");
  }
  await prisma.group.delete({ where: { id } });
  revalidatePath("/admin/groups");
}
