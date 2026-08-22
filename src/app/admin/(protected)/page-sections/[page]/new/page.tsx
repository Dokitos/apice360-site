import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PageSectionForm } from "@/components/admin/PageSectionForm";
import { createPageSection } from "../../actions";

const VALID_PAGES = ["HOME", "QUEM_SOMOS", "SERVICOS", "PORTFOLIO", "BLOG", "CONTACTO", "AREA_ARQUITETO"] as const;

export default async function NewPageSectionPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  if (!VALID_PAGES.includes(page as (typeof VALID_PAGES)[number])) notFound();
  const pageKey = page as (typeof VALID_PAGES)[number];

  const ctasRaw = await prisma.cta.findMany({
    orderBy: { key: "asc" },
    select: { key: true, translations: { where: { locale: "PT" }, select: { label: true } } },
  });
  const ctas = ctasRaw.map((c) => ({ key: c.key, label: c.translations[0]?.label ?? c.key }));

  return (
    <div>
      <AdminPageHeader title="Nova Secção" />
      <PageSectionForm action={createPageSection.bind(null, pageKey)} ctas={ctas} />
    </div>
  );
}
