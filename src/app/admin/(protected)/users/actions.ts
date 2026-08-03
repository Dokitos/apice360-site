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
      isActive: parsed.data.isActive,
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUser(id: string, _prevState: string | undefined, formData: FormData) {
  await requireAdmin();
  const parsed = updateUserSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing && existing.id !== id) return "Já existe outro utilizador com este email.";

  await prisma.user.update({
    where: { id },
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      role: parsed.data.role,
      isActive: parsed.data.isActive,
      ...(parsed.data.password ? { passwordHash: await bcrypt.hash(parsed.data.password, 12) } : {}),
    },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUser(id: string) {
  const currentUser = await requireAdmin();
  if (currentUser.id === id) {
    throw new Error("Não podes eliminar a tua própria conta.");
  }
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/users");
}
