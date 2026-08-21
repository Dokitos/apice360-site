"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { testimonialSchema } from "@/lib/validations/testimonial";
import { resolveTranslations, type ExistingTranslationRow } from "@/lib/auto-translate";

const TRANSLATABLE_FIELDS = [{ key: "quote" }];

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
    quoteEs: formData.get("quoteEs"),
    quoteFr: formData.get("quoteFr"),
  };
}

async function buildTranslationsPayload(
  data: { quotePt: string; quoteEn?: string; quoteEs?: string; quoteFr?: string },
  existingTranslations: ExistingTranslationRow[],
) {
  const resolved = await resolveTranslations({
    fields: TRANSLATABLE_FIELDS,
    ptValues: { quote: data.quotePt },
    submittedValues: {
      EN: { quote: data.quoteEn ?? null },
      ES: { quote: data.quoteEs ?? null },
      FR: { quote: data.quoteFr ?? null },
    },
    existingTranslations,
  });

  return [
    { locale: "PT" as const, isAutoTranslated: false, quote: data.quotePt },
    ...resolved.map((r) => ({ locale: r.locale, isAutoTranslated: r.isAutoTranslated, quote: r.fields.quote ?? "" })),
  ];
}

export async function createTestimonial(_prevState: string | undefined, formData: FormData) {
  await requirePermission("testimonials", "create");
  const parsed = testimonialSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { quotePt, quoteEn, quoteEs, quoteFr, ...data } = parsed.data;
  const translations = await buildTranslationsPayload({ quotePt, quoteEn, quoteEs, quoteFr }, []);

  await prisma.testimonial.create({
    data: {
      ...data,
      translations: { create: translations },
    },
  });
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  redirect("/admin/testimonials?saved=1");
}

export async function updateTestimonial(
  id: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requirePermission("testimonials", "edit");
  const parsed = testimonialSchema.safeParse(readForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const { quotePt, quoteEn, quoteEs, quoteFr, ...data } = parsed.data;
  const current = await prisma.testimonial.findUnique({ where: { id }, select: { translations: true } });
  const translations = await buildTranslationsPayload(
    { quotePt, quoteEn, quoteEs, quoteFr },
    current?.translations ?? [],
  );

  await prisma.testimonial.update({
    where: { id },
    data: {
      ...data,
      translations: {
        upsert: translations.map((t) => ({
          where: { testimonialId_locale: { testimonialId: id, locale: t.locale } },
          update: { quote: t.quote, isAutoTranslated: t.isAutoTranslated },
          create: t,
        })),
      },
    },
  });
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
  redirect("/admin/testimonials?saved=1");
}

export async function deleteTestimonial(id: string) {
  await requirePermission("testimonials", "delete");
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath("/admin/testimonials");
  revalidatePath("/");
}
