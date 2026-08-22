import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CustomPageForm } from "@/components/admin/CustomPageForm";
import { SectionsEditor } from "@/components/admin/SectionsEditor";
import { updateCustomPage } from "../../actions";
import {
  createCustomPageSection,
  updateCustomPageSection,
  deleteCustomPageSection,
  createCustomPageSectionItem,
  updateCustomPageSectionItem,
  deleteCustomPageSectionItem,
  reorderCustomPageSections,
  reorderCustomPageSectionItems,
} from "../../../page-sections/actions";

export default async function EditCustomPagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ open?: string }>;
}) {
  const { id } = await params;
  const { open } = await searchParams;
  const [page, sections, ctasRaw] = await Promise.all([
    prisma.customPage.findUnique({ where: { id }, include: { translations: true } }),
    prisma.pageSection.findMany({
      where: { customPageId: id },
      orderBy: { order: "asc" },
      include: {
        translations: true,
        items: { orderBy: { order: "asc" }, include: { translations: true } },
      },
    }),
    prisma.cta.findMany({
      orderBy: { key: "asc" },
      select: { key: true, translations: { where: { locale: "PT" }, select: { label: true } } },
    }),
  ]);
  if (!page) notFound();
  const ctas = ctasRaw.map((c) => ({ key: c.key, label: c.translations[0]?.label ?? c.key }));

  const sectionsWithActions = sections.map((s) => ({
    ...s,
    updateAction: updateCustomPageSection.bind(null, id, s.id),
    deleteAction: deleteCustomPageSection.bind(null, id, s.id),
    createItemAction: createCustomPageSectionItem.bind(null, id, s.id),
    reorderItemsAction: reorderCustomPageSectionItems.bind(null, id, s.id),
    items: s.items.map((i) => ({
      ...i,
      updateAction: updateCustomPageSectionItem.bind(null, id, s.id, i.id),
      deleteAction: deleteCustomPageSectionItem.bind(null, id, s.id, i.id),
    })),
  }));

  return (
    <div>
      <AdminPageHeader title={`Página: ${page.translations.find((t) => t.locale === "PT")?.navLabel ?? page.slug}`} />
      <CustomPageForm page={page} action={updateCustomPage.bind(null, id)} />

      <div className="mt-16">
        <h2 className="mb-2 font-heading text-headline-lg">Secções</h2>
        <p className="mb-8 text-sm text-on-surface-variant">Blocos de conteúdo desta página, na ordem em que aparecem.</p>
        <SectionsEditor
          sections={sectionsWithActions}
          ctas={ctas}
          createSectionAction={createCustomPageSection.bind(null, id)}
          reorderSectionsAction={reorderCustomPageSections.bind(null, id)}
          initialOpenId={open ?? null}
        />
      </div>
    </div>
  );
}
