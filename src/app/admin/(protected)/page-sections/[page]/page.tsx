import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SectionsEditor } from "@/components/admin/SectionsEditor";
import {
  createPageSection,
  updatePageSection,
  deletePageSection,
  createPageSectionItem,
  updatePageSectionItem,
  deletePageSectionItem,
  reorderPageSections,
  reorderPageSectionItems,
} from "../actions";

const VALID_PAGES = [
  "HOME",
  "QUEM_SOMOS",
  "SERVICOS",
  "PORTFOLIO",
  "BLOG",
  "CONTACTO",
  "AREA_ARQUITETO",
  "LP",
  "LSF",
] as const;

const PAGE_LABELS: Record<(typeof VALID_PAGES)[number], string> = {
  HOME: "Home",
  QUEM_SOMOS: "Quem Somos",
  SERVICOS: "Serviços",
  PORTFOLIO: "Portfólio",
  BLOG: "Blog",
  CONTACTO: "Contacto",
  AREA_ARQUITETO: "Área do Arquiteto",
  LP: "Landing Page (/lp)",
  LSF: "LSF (/lsf)",
};

export default async function PageSectionsEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ page: string }>;
  searchParams: Promise<{ open?: string }>;
}) {
  const { page } = await params;
  const { open } = await searchParams;
  if (!VALID_PAGES.includes(page as (typeof VALID_PAGES)[number])) notFound();
  const pageKey = page as (typeof VALID_PAGES)[number];
  await requirePermission("page_sections", "view");

  const [sections, ctasRaw] = await Promise.all([
    prisma.pageSection.findMany({
      where: { page: pageKey },
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
  const ctas = ctasRaw.map((c) => ({ key: c.key, label: c.translations[0]?.label ?? c.key }));

  const sectionsWithActions = sections.map((s) => ({
    ...s,
    updateAction: updatePageSection.bind(null, pageKey, s.id),
    deleteAction: deletePageSection.bind(null, pageKey, s.id),
    createItemAction: createPageSectionItem.bind(null, pageKey, s.id),
    reorderItemsAction: reorderPageSectionItems.bind(null, pageKey, s.id),
    items: s.items.map((i) => ({
      ...i,
      updateAction: updatePageSectionItem.bind(null, pageKey, s.id, i.id),
      deleteAction: deletePageSectionItem.bind(null, pageKey, s.id, i.id),
    })),
  }));

  return (
    <div>
      <AdminPageHeader
        title={`Secções: ${PAGE_LABELS[pageKey]}`}
        description="Gere os blocos de conteúdo desta página — arrasta para reordenar, clica para editar."
      />
      <SectionsEditor
        sections={sectionsWithActions}
        ctas={ctas}
        createSectionAction={createPageSection.bind(null, pageKey)}
        reorderSectionsAction={reorderPageSections.bind(null, pageKey)}
        initialOpenId={open ?? null}
      />
    </div>
  );
}
