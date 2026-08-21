"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { portfolioProjectSchema, projectImageSchema } from "@/lib/validations/portfolio";
import { sanitizeRichText } from "@/lib/sanitize-rich-text";
import { resolveTranslations, type ExistingTranslationRow } from "@/lib/auto-translate";

const clean = (v?: string | null) => (v ? sanitizeRichText(v) : v);

const PROJECT_FIELDS = [
  { key: "title" },
  { key: "shortDescription" },
  { key: "challenge", isHtml: true },
  { key: "methodology", isHtml: true },
  { key: "result", isHtml: true },
  { key: "testimonialQuote" },
];

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
    titleEs: formData.get("titleEs"),
    titleFr: formData.get("titleFr"),
    shortDescriptionPt: formData.get("shortDescriptionPt") || undefined,
    shortDescriptionEn: formData.get("shortDescriptionEn") || undefined,
    shortDescriptionEs: formData.get("shortDescriptionEs") || undefined,
    shortDescriptionFr: formData.get("shortDescriptionFr") || undefined,
    challengePt: formData.get("challengePt") || undefined,
    challengeEn: formData.get("challengeEn") || undefined,
    challengeEs: formData.get("challengeEs") || undefined,
    challengeFr: formData.get("challengeFr") || undefined,
    methodologyPt: formData.get("methodologyPt") || undefined,
    methodologyEn: formData.get("methodologyEn") || undefined,
    methodologyEs: formData.get("methodologyEs") || undefined,
    methodologyFr: formData.get("methodologyFr") || undefined,
    resultPt: formData.get("resultPt") || undefined,
    resultEn: formData.get("resultEn") || undefined,
    resultEs: formData.get("resultEs") || undefined,
    resultFr: formData.get("resultFr") || undefined,
    testimonialQuotePt: formData.get("testimonialQuotePt") || undefined,
    testimonialQuoteEn: formData.get("testimonialQuoteEn") || undefined,
    testimonialQuoteEs: formData.get("testimonialQuoteEs") || undefined,
    testimonialQuoteFr: formData.get("testimonialQuoteFr") || undefined,
  };
}

async function buildProjectTranslations(
  data: {
    titlePt: string; shortDescriptionPt?: string; challengePt?: string; methodologyPt?: string; resultPt?: string; testimonialQuotePt?: string;
    titleEn?: string; shortDescriptionEn?: string; challengeEn?: string; methodologyEn?: string; resultEn?: string; testimonialQuoteEn?: string;
    titleEs?: string; shortDescriptionEs?: string; challengeEs?: string; methodologyEs?: string; resultEs?: string; testimonialQuoteEs?: string;
    titleFr?: string; shortDescriptionFr?: string; challengeFr?: string; methodologyFr?: string; resultFr?: string; testimonialQuoteFr?: string;
  },
  existingTranslations: ExistingTranslationRow[],
) {
  const ptChallenge = clean(data.challengePt);
  const ptMethodology = clean(data.methodologyPt);
  const ptResult = clean(data.resultPt);

  const resolved = await resolveTranslations({
    fields: PROJECT_FIELDS,
    ptValues: {
      title: data.titlePt,
      shortDescription: data.shortDescriptionPt ?? null,
      challenge: ptChallenge ?? null,
      methodology: ptMethodology ?? null,
      result: ptResult ?? null,
      testimonialQuote: data.testimonialQuotePt ?? null,
    },
    submittedValues: {
      EN: { title: data.titleEn ?? null, shortDescription: data.shortDescriptionEn ?? null, challenge: data.challengeEn ?? null, methodology: data.methodologyEn ?? null, result: data.resultEn ?? null, testimonialQuote: data.testimonialQuoteEn ?? null },
      ES: { title: data.titleEs ?? null, shortDescription: data.shortDescriptionEs ?? null, challenge: data.challengeEs ?? null, methodology: data.methodologyEs ?? null, result: data.resultEs ?? null, testimonialQuote: data.testimonialQuoteEs ?? null },
      FR: { title: data.titleFr ?? null, shortDescription: data.shortDescriptionFr ?? null, challenge: data.challengeFr ?? null, methodology: data.methodologyFr ?? null, result: data.resultFr ?? null, testimonialQuote: data.testimonialQuoteFr ?? null },
    },
    existingTranslations,
  });

  return [
    {
      locale: "PT" as const,
      isAutoTranslated: false,
      title: data.titlePt,
      shortDescription: data.shortDescriptionPt ?? null,
      challenge: ptChallenge ?? null,
      methodology: ptMethodology ?? null,
      result: ptResult ?? null,
      testimonialQuote: data.testimonialQuotePt ?? null,
    },
    ...resolved.map((r) => ({
      locale: r.locale,
      isAutoTranslated: r.isAutoTranslated,
      title: r.fields.title ?? "",
      shortDescription: r.fields.shortDescription,
      challenge: clean(r.fields.challenge),
      methodology: clean(r.fields.methodology),
      result: clean(r.fields.result),
      testimonialQuote: r.fields.testimonialQuote,
    })),
  ];
}

export async function createProject(_prevState: string | undefined, formData: FormData) {
  await requirePermission("portfolio", "create");
  const parsed = portfolioProjectSchema.safeParse(readProjectForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const {
    titlePt, titleEn, titleEs, titleFr,
    shortDescriptionPt, shortDescriptionEn, shortDescriptionEs, shortDescriptionFr,
    challengePt, challengeEn, challengeEs, challengeFr,
    methodologyPt, methodologyEn, methodologyEs, methodologyFr,
    resultPt, resultEn, resultEs, resultFr,
    testimonialQuotePt, testimonialQuoteEn, testimonialQuoteEs, testimonialQuoteFr,
    ...data
  } = parsed.data;

  const existing = await prisma.portfolioProject.findUnique({ where: { slug: data.slug } });
  if (existing) return "Já existe um projeto com este slug.";

  const translations = await buildProjectTranslations(
    {
      titlePt, shortDescriptionPt, challengePt, methodologyPt, resultPt, testimonialQuotePt,
      titleEn, shortDescriptionEn, challengeEn, methodologyEn, resultEn, testimonialQuoteEn,
      titleEs, shortDescriptionEs, challengeEs, methodologyEs, resultEs, testimonialQuoteEs,
      titleFr, shortDescriptionFr, challengeFr, methodologyFr, resultFr, testimonialQuoteFr,
    },
    [],
  );

  const project = await prisma.portfolioProject.create({
    data: {
      ...data,
      publishedAt: data.isPublished ? new Date() : null,
      translations: { create: translations },
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
  await requirePermission("portfolio", "edit");
  const parsed = portfolioProjectSchema.safeParse(readProjectForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const {
    titlePt, titleEn, titleEs, titleFr,
    shortDescriptionPt, shortDescriptionEn, shortDescriptionEs, shortDescriptionFr,
    challengePt, challengeEn, challengeEs, challengeFr,
    methodologyPt, methodologyEn, methodologyEs, methodologyFr,
    resultPt, resultEn, resultEs, resultFr,
    testimonialQuotePt, testimonialQuoteEn, testimonialQuoteEs, testimonialQuoteFr,
    ...data
  } = parsed.data;

  const existing = await prisma.portfolioProject.findUnique({ where: { slug: data.slug } });
  if (existing && existing.id !== id) return "Já existe outro projeto com este slug.";

  const current = await prisma.portfolioProject.findUnique({ where: { id }, include: { translations: true } });
  const translations = await buildProjectTranslations(
    {
      titlePt, shortDescriptionPt, challengePt, methodologyPt, resultPt, testimonialQuotePt,
      titleEn, shortDescriptionEn, challengeEn, methodologyEn, resultEn, testimonialQuoteEn,
      titleEs, shortDescriptionEs, challengeEs, methodologyEs, resultEs, testimonialQuoteEs,
      titleFr, shortDescriptionFr, challengeFr, methodologyFr, resultFr, testimonialQuoteFr,
    },
    current?.translations ?? [],
  );

  await prisma.portfolioProject.update({
    where: { id },
    data: {
      ...data,
      publishedAt: data.isPublished && !current?.publishedAt ? new Date() : current?.publishedAt,
      translations: {
        upsert: translations.map((t) => {
          const { locale, ...fields } = t;
          return {
            where: { projectId_locale: { projectId: id, locale } },
            update: fields,
            create: t,
          };
        }),
      },
    },
  });

  revalidatePath("/admin/portfolio");
  revalidatePath("/");
  redirect(`/admin/portfolio/${id}/edit?saved=1`);
}

export async function deleteProject(id: string) {
  await requirePermission("portfolio", "delete");
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
  await requirePermission("portfolio", "edit");
  const parsed = projectImageSchema.safeParse(readImageForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  await prisma.projectImage.create({ data: { ...parsed.data, projectId } });
  revalidatePath(`/admin/portfolio/${projectId}/edit`);
  revalidatePath("/");
  redirect(`/admin/portfolio/${projectId}/edit?saved=1`);
}

export async function deleteProjectImage(projectId: string, imageId: string) {
  await requirePermission("portfolio", "edit");
  await prisma.projectImage.delete({ where: { id: imageId } });
  revalidatePath(`/admin/portfolio/${projectId}/edit`);
  revalidatePath("/");
}
