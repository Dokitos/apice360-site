"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/permissions";
import { statSchema } from "@/lib/validations/stat";

function readForm(formData: FormData) {
  return {
    value: formData.get("value"),
    iconName: formData.get("iconName") || undefined,
    order: formData.get("order"),
    isActive: formData.get("isActive") === "on",
    labelPt: formData.get("labelPt"),
    labelEn: formData.get("labelEn"),
  };
}

export async function createStat(_prevState: string | undefined, formData: FormData) {
  await requireEditorOrAdmin();
  const parsed = statSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { labelPt, labelEn, ...data } = parsed.data;
  await prisma.stat.create({
    data: {
      ...data,
      translations: {
        create: [
          { locale: "PT", label: labelPt },
          { locale: "EN", label: labelEn },
        ],
      },
    },
  });
  revalidatePath("/admin/stats");
  revalidatePath("/");
  redirect("/admin/stats?saved=1");
}

export async function updateStat(id: string, _prevState: string | undefined, formData: FormData) {
  await requireEditorOrAdmin();
  const parsed = statSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { labelPt, labelEn, ...data } = parsed.data;
  await prisma.stat.update({
    where: { id },
    data: {
      ...data,
      translations: {
        upsert: [
          {
            where: { statId_locale: { statId: id, locale: "PT" } },
            update: { label: labelPt },
            create: { locale: "PT", label: labelPt },
          },
          {
            where: { statId_locale: { statId: id, locale: "EN" } },
            update: { label: labelEn },
            create: { locale: "EN", label: labelEn },
          },
        ],
      },
    },
  });
  revalidatePath("/admin/stats");
  revalidatePath("/");
  redirect("/admin/stats?saved=1");
}

export async function deleteStat(id: string) {
  await requireEditorOrAdmin();
  await prisma.stat.delete({ where: { id } });
  revalidatePath("/admin/stats");
  revalidatePath("/");
}
