import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PageSeoForm } from "@/components/admin/PageSeoForm";
import { upsertPageSeo } from "../actions";

const VALID_PAGES = [
  "HOME",
  "QUEM_SOMOS",
  "SERVICOS",
  "PORTFOLIO",
  "BLOG",
  "CONTACTO",
  "AREA_ARQUITETO",
] as const;

export default async function EditPageSeoPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  if (!VALID_PAGES.includes(page as (typeof VALID_PAGES)[number])) notFound();
  const pageKey = page as (typeof VALID_PAGES)[number];

  const seo = await prisma.pageSeo.findUnique({
    where: { page: pageKey },
    include: { translations: true },
  });

  return (
    <div>
      <AdminPageHeader title={`SEO: ${pageKey}`} />
      <PageSeoForm seo={seo ?? undefined} action={upsertPageSeo.bind(null, pageKey)} />
    </div>
  );
}
