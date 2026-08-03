"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/permissions";
import { testimonialSchema } from "@/lib/validations/testimonial";

function readForm(formData: FormData) {
  return {
    authorName: formData.get("authorName"),
    location: formData.get("location") || undefined,
    avatarUrl: formData.get("avatarUrl") || undefined,
    rating: formData.get("rating"),
    order: formData.get("order"),
    showOnHome: formData.get("showOnHome") === "on",
    isActive: formData.get("isActive") === "on",
    quotePt: formData.get("quotePt"),
    quoteEn: formData.get("quoteEn"),
  };
}

export async function createTestimonial(_prevState: string | undefined, formData: FormData) {
  await requireEditorOrAdmin();
  const parsed = testimonialSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { quotePt, quoteEn, ...data } = parsed.data;
  await prisma.testimonial.create({
    data: {
      ...data,
      translations: {
        create: [
          { locale: "PT", quote: quotePt },
          { locale: "EN", quote: quoteEn },
        ],
      },
    },
  });
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  redirect("/admin/testimonials");
}

export async function updateTestimonial(
  id: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requireEditorOrAdmin();
  const parsed = testimonialSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { quotePt, quoteEn, ...data } = parsed.data;
  await prisma.testimonial.update({
    where: { id },
    data: {
      ...data,
      translations: {
        upsert: [
          {
            where: { testimonialId_locale: { testimonialId: id, locale: "PT" } },
            update: { quote: quotePt },
            create: { locale: "PT", quote: quotePt },
          },
          {
            where: { testimonialId_locale: { testimonialId: id, locale: "EN" } },
            update: { quote: quoteEn },
            create: { locale: "EN", quote: quoteEn },
          },
        ],
      },
    },
  });
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  redirect("/admin/testimonials");
}

export async function deleteTestimonial(id: string) {
  await requireEditorOrAdmin();
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}
