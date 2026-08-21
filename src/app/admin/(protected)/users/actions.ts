"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user";

function readForm(formData: FormData) {
  return {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password") || undefined,
    role: formData.get("role"),
    groupId: formData.get("groupId") || undefined,
    isActive: formData.get("isActive") === "on",
  };
}

export async function createUser(_prevState: string | undefined, formData: FormData) {
  await requireAdmin();
  const parsed = createUserSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return "Já existe um utilizador com este email.";

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      groupId: parsed.data.groupId || null,
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}

export async function updateUser(id: string, _prevState: string | undefined, formData: FormData) {
  const currentUser = await requireAdmin();
  const parsed = updateUserSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing && existing.id !== id) return "Já existe outro utilizador com este email.";

  if (currentUser.id === id && (parsed.data.role !== "ADMIN" || !parsed.data.isActive)) {
    return "Não podes remover o teu próprio acesso de administrador.";
  }

  const demotesOrDeactivatesAdmin = parsed.data.role !== "ADMIN" || !parsed.data.isActive;
  if (demotesOrDeactivatesAdmin) {
    const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
    if (target?.role === "ADMIN") {
      const activeAdmins = await prisma.user.count({ where: { role: "ADMIN", isActive: true } });
      if (activeAdmins <= 1) {
        return "Não é possível remover o único administrador ativo.";
      }
    }
  }

  await prisma.user.update({
    where: { id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      groupId: parsed.data.groupId || null,
      isActive: parsed.data.isActive,
      ...(parsed.data.password ? { passwordHash: await bcrypt.hash(parsed.data.password, 12) } : {}),
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users?saved=1");
}

export async function deleteUser(id: string) {
  const currentUser = await requireAdmin();
  if (currentUser.id === id) {
    throw new Error("Não podes eliminar a tua própria conta.");
  }
  const target = await prisma.user.findUnique({ where: { id }, select: { role: true } });
  if (target?.role === "ADMIN") {
    const activeAdmins = await prisma.user.count({ where: { role: "ADMIN", isActive: true } });
    if (activeAdmins <= 1) {
      throw new Error("Não é possível eliminar o único administrador ativo.");
    }
  }
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}
