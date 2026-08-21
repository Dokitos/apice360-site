import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PageSectionItemForm } from "@/components/admin/PageSectionItemForm";
import { updateCustomPageSectionItem } from "../../../../../../../page-sections/actions";

export default async function EditCustomPageSectionItemPage({
  params,
}: {
  params: Promise<{ id: string; sectionId: string; itemId: string }>;
}) {
  const { id, sectionId, itemId } = await params;

  const [section, item, ctasRaw] = await Promise.all([
    prisma.pageSection.findUnique({ where: { id: sectionId } }),
    prisma.pageSectionItem.findUnique({
      where: { id: itemId },
      include: { translations: true },
    }),
    prisma.cta.findMany({
      orderBy: { key: "asc" },
      select: { key: true, translations: { where: { locale: "PT" }, select: { label: true } } },
    }),
  ]);
  if (!section || section.customPageId !== id || !item) notFound();
  const ctas = ctasRaw.map((c) => ({ key: c.key, label: c.translations[0]?.label ?? c.key }));

  return (
    <div>
      <AdminPageHeader title="Editar Item" />
      <PageSectionItemForm item={item} ctas={ctas} action={updateCustomPageSectionItem.bind(null, id, sectionId, itemId)} />
    </div>
  );
}
