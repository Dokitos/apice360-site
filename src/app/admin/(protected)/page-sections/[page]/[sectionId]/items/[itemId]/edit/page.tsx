import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PageSectionItemForm } from "@/components/admin/PageSectionItemForm";
import { updatePageSectionItem } from "../../../../../actions";

const VALID_PAGES = ["HOME", "QUEM_SOMOS", "SERVICOS", "CONTACTO", "AREA_ARQUITETO"] as const;

export default async function EditPageSectionItemPage({
  params,
}: {
  params: Promise<{ page: string; sectionId: string; itemId: string }>;
}) {
  const { page, sectionId, itemId } = await params;
  if (!VALID_PAGES.includes(page as (typeof VALID_PAGES)[number])) notFound();
  const pageKey = page as (typeof VALID_PAGES)[number];

  const item = await prisma.pageSectionItem.findUnique({
    where: { id: itemId },
    include: { translations: true },
  });
  if (!item) notFound();

  return (
    <div>
      <AdminPageHeader title="Editar Item" />
      <PageSectionItemForm item={item} action={updatePageSectionItem.bind(null, pageKey, sectionId, itemId)} />
    </div>
  );
}
