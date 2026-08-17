"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/permissions";
import { ctaSchema } from "@/lib/validations/cta";

function readForm(formData: FormData) {
  return {
    key: formData.get("key"),
    url: formData.get("url"),
    style: formData.get("style") || "primary",
    iconName: formData.get("iconName") || undefined,
    isActive: formData.get("isActive") === "on",
    labelPt: formData.get("labelPt"),
    labelEn: formData.get("labelEn"),
  };
}

export async function createCta(_prevState: string | undefined, formData: FormData) {
  await requireEditorOrAdmin();
  const parsed = ctaSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { labelPt, labelEn, ...data } = parsed.data;

  const existing = await prisma.cta.findUnique({ where: { key: data.key } });
  if (existing) return "Já existe um CTA com esta chave.";

  await prisma.cta.create({
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
  revalidatePath("/admin/ctas");
  revalidatePath("/");
  redirect("/admin/ctas?saved=1");
}

export async function updateCta(id: string, _prevState: string | undefined, formData: FormData) {
  await requireEditorOrAdmin();
  const parsed = ctaSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { labelPt, labelEn, ...data } = parsed.data;
  await prisma.cta.update({
    where: { id },
    data: {
      ...data,
      translations: {
        upsert: [
          {
            where: { ctaId_locale: { ctaId: id, locale: "PT" } },
            update: { label: labelPt },
            create: { locale: "PT", label: labelPt },
          },
          {
            where: { ctaId_locale: { ctaId: id, locale: "EN" } },
            update: { label: labelEn },
            create: { locale: "EN", label: labelEn },
          },
        ],
      },
    },
  });
  revalidatePath("/admin/ctas");
  revalidatePath("/");
  redirect("/admin/ctas?saved=1");
}

export async function deleteCta(id: string) {
  await requireEditorOrAdmin();
  await prisma.cta.delete({ where: { id } });
  revalidatePath("/admin/ctas");
  revalidatePath("/");
}
