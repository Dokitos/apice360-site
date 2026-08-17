"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/permissions";
import { portfolioProjectSchema, projectImageSchema } from "@/lib/validations/portfolio";

function readProjectForm(formData: FormData) {
  return {
    slug: formData.get("slug"),
    category: formData.get("category"),
    locationLabel: formData.get("locationLabel") || undefined,
    clientName: formData.get("clientName") || undefined,
    clientLocation: formData.get("clientLocation") || undefined,
    coverImageUrl: formData.get("coverImageUrl") || undefined,
    order: formData.get("order"),
    isFeatured: formData.get("isFeatured") === "on",
    isPublished: formData.get("isPublished") === "on",
    titlePt: formData.get("titlePt"),
    titleEn: formData.get("titleEn"),
    shortDescriptionPt: formData.get("shortDescriptionPt") || undefined,
    shortDescriptionEn: formData.get("shortDescriptionEn") || undefined,
    challengePt: formData.get("challengePt") || undefined,
    challengeEn: formData.get("challengeEn") || undefined,
    methodologyPt: formData.get("methodologyPt") || undefined,
    methodologyEn: formData.get("methodologyEn") || undefined,
    resultPt: formData.get("resultPt") || undefined,
    resultEn: formData.get("resultEn") || undefined,
    testimonialQuotePt: formData.get("testimonialQuotePt") || undefined,
    testimonialQuoteEn: formData.get("testimonialQuoteEn") || undefined,
  };
}

export async function createProject(_prevState: string | undefined, formData: FormData) {
  await requireEditorOrAdmin();
  const parsed = portfolioProjectSchema.safeParse(readProjectForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const {
    titlePt,
    titleEn,
    shortDescriptionPt,
    shortDescriptionEn,
    challengePt,
    challengeEn,
    methodologyPt,
    methodologyEn,
    resultPt,
    resultEn,
    testimonialQuotePt,
    testimonialQuoteEn,
    ...data
  } = parsed.data;

  const existing = await prisma.portfolioProject.findUnique({ where: { slug: data.slug } });
  if (existing) return "Já existe um projeto com este slug.";

  const project = await prisma.portfolioProject.create({
    data: {
      ...data,
      publishedAt: data.isPublished ? new Date() : null,
      translations: {
        create: [
          {
            locale: "PT",
            title: titlePt,
            shortDescription: shortDescriptionPt,
            challenge: challengePt,
            methodology: methodologyPt,
            result: resultPt,
            testimonialQuote: testimonialQuotePt,
          },
          {
            locale: "EN",
            title: titleEn,
            shortDescription: shortDescriptionEn,
            challenge: challengeEn,
            methodology: methodologyEn,
            result: resultEn,
            testimonialQuote: testimonialQuoteEn,
          },
        ],
      },
    },
  });

  revalidatePath("/admin/portfolio");
  revalidatePath("/");
  redirect(`/admin/portfolio/${project.id}/edit?saved=1`);
}

export async function updateProject(
  id: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requireEditorOrAdmin();
  const parsed = portfolioProjectSchema.safeParse(readProjectForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const {
    titlePt,
    titleEn,
    shortDescriptionPt,
    shortDescriptionEn,
    challengePt,
    challengeEn,
    methodologyPt,
    methodologyEn,
    resultPt,
    resultEn,
    testimonialQuotePt,
    testimonialQuoteEn,
    ...data
  } = parsed.data;

  const existing = await prisma.portfolioProject.findUnique({ where: { slug: data.slug } });
  if (existing && existing.id !== id) return "Já existe outro projeto com este slug.";

  const current = await prisma.portfolioProject.findUnique({ where: { id } });

  await prisma.portfolioProject.update({
    where: { id },
    data: {
      ...data,
      publishedAt: data.isPublished && !current?.publishedAt ? new Date() : current?.publishedAt,
      translations: {
        upsert: [
          {
            where: { projectId_locale: { projectId: id, locale: "PT" } },
            update: {
              title: titlePt,
              shortDescription: shortDescriptionPt,
              challenge: challengePt,
              methodology: methodologyPt,
              result: resultPt,
              testimonialQuote: testimonialQuotePt,
            },
            create: {
              locale: "PT",
              title: titlePt,
              shortDescription: shortDescriptionPt,
              challenge: challengePt,
              methodology: methodologyPt,
              result: resultPt,
              testimonialQuote: testimonialQuotePt,
            },
          },
          {
            where: { projectId_locale: { projectId: id, locale: "EN" } },
            update: {
              title: titleEn,
              shortDescription: shortDescriptionEn,
              challenge: challengeEn,
              methodology: methodologyEn,
              result: resultEn,
              testimonialQuote: testimonialQuoteEn,
            },
            create: {
              locale: "EN",
              title: titleEn,
              shortDescription: shortDescriptionEn,
              challenge: challengeEn,
              methodology: methodologyEn,
              result: resultEn,
              testimonialQuote: testimonialQuoteEn,
            },
          },
        ],
      },
    },
  });

  revalidatePath("/admin/portfolio");
  revalidatePath("/");
  redirect(`/admin/portfolio/${id}/edit?saved=1`);
}

export async function deleteProject(id: string) {
  await requireEditorOrAdmin();
  await prisma.portfolioProject.delete({ where: { id } });
  revalidatePath("/admin/portfolio");
  revalidatePath("/");
}

function readImageForm(formData: FormData) {
  return {
    url: formData.get("url"),
    alt: formData.get("alt") || undefined,
    order: formData.get("order"),
  };
}

export async function createProjectImage(
  projectId: string,
  _prevState: string | undefined,
  formData: FormData,
) {
  await requireEditorOrAdmin();
  const parsed = projectImageSchema.safeParse(readImageForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  await prisma.projectImage.create({ data: { ...parsed.data, projectId } });
  revalidatePath(`/admin/portfolio/${projectId}/edit`);
  revalidatePath("/");
  redirect(`/admin/portfolio/${projectId}/edit?saved=1`);
}

export async function deleteProjectImage(projectId: string, imageId: string) {
  await requireEditorOrAdmin();
  await prisma.projectImage.delete({ where: { id: imageId } });
  revalidatePath(`/admin/portfolio/${projectId}/edit`);
  revalidatePath("/");
}
