import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PageSectionItemForm } from "@/components/admin/PageSectionItemForm";
import { createCustomPageSectionItem } from "../../../../../../page-sections/actions";

export default async function NewCustomPageSectionItemPage({
  params,
}: {
  params: Promise<{ id: string; sectionId: string }>;
}) {
  const { id, sectionId } = await params;

  const [section, ctasRaw] = await Promise.all([
    prisma.pageSection.findUnique({ where: { id: sectionId } }),
    prisma.cta.findMany({
      orderBy: { key: "asc" },
      select: { key: true, translations: { where: { locale: "PT" }, select: { label: true } } },
    }),
  ]);
  if (!section || section.customPageId !== id) notFound();
  const ctas = ctasRaw.map((c) => ({ key: c.key, label: c.translations[0]?.label ?? c.key }));

  return (
    <div>
      <AdminPageHeader title="Novo Item" />
      <PageSectionItemForm action={createCustomPageSectionItem.bind(null, id, sectionId)} ctas={ctas} />
    </div>
  );
}
