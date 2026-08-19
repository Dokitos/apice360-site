import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PageSectionItemForm } from "@/components/admin/PageSectionItemForm";
import { createPageSectionItem } from "../../../../actions";

const VALID_PAGES = ["HOME", "QUEM_SOMOS", "SERVICOS", "CONTACTO", "AREA_ARQUITETO"] as const;

export default async function NewPageSectionItemPage({
  params,
}: {
  params: Promise<{ page: string; sectionId: string }>;
}) {
  const { page, sectionId } = await params;
  if (!VALID_PAGES.includes(page as (typeof VALID_PAGES)[number])) notFound();
  const pageKey = page as (typeof VALID_PAGES)[number];

  const [section, ctasRaw] = await Promise.all([
    prisma.pageSection.findUnique({ where: { id: sectionId } }),
    prisma.cta.findMany({
      orderBy: { key: "asc" },
      select: { key: true, translations: { where: { locale: "PT" }, select: { label: true } } },
    }),
  ]);
  if (!section) notFound();
  const ctas = ctasRaw.map((c) => ({ key: c.key, label: c.translations[0]?.label ?? c.key }));

  return (
    <div>
      <AdminPageHeader title="Novo Item" />
      <PageSectionItemForm action={createPageSectionItem.bind(null, pageKey, sectionId)} ctas={ctas} />
    </div>
  );
}
