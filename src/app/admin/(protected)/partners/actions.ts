"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { partnerSchema } from "@/lib/validations/partner";

function readForm(formData: FormData) {
  return {
    name: formData.get("name"),
    logoUrl: formData.get("logoUrl"),
    websiteUrl: formData.get("websiteUrl") || undefined,
    cardSize: formData.get("cardSize") || "MD",
    order: formData.get("order"),
    isActive: formData.get("isActive") === "on",
  };
}

export async function createPartner(_prevState: string | undefined, formData: FormData) {
  await requirePermission("partners", "create");

  const parsed = partnerSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Dados inválidos.";
  }

  await prisma.partner.create({ data: parsed.data });
  revalidatePath("/admin/partners");
  revalidatePath("/");
  redirect("/admin/partners?saved=1");
}

export async function updatePartner(
  id: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requirePermission("partners", "edit");

  const parsed = partnerSchema.safeParse(readForm(formData));
  if (!parsed.success) {
    return parsed.error.issues[0]?.message ?? "Dados inválidos.";
  }

  await prisma.partner.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/partners");
  revalidatePath("/");
  redirect("/admin/partners?saved=1");
}

export async function deletePartner(id: string) {
  await requirePermission("partners", "delete");
  await prisma.partner.delete({ where: { id } });
  revalidatePath("/admin/partners");
  revalidatePath("/");
}
