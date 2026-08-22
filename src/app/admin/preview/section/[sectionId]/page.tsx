import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { GenericPageSection, type GenericSectionData } from "@/components/sections/GenericPageSection";

export default async function PreviewSectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ sectionId: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  await requirePermission("page_sections", "view");
  const { sectionId } = await params;
  const sp = await searchParams;

  const section = await prisma.pageSection.findUnique({
    where: { id: sectionId },
    include: {
      translations: { where: { locale: "PT" } },
      items: { orderBy: { order: "asc" }, include: { translations: { where: { locale: "PT" } } } },
    },
  });
  if (!section) notFound();
  const pt = section.translations[0];

  const data: GenericSectionData = {
    key: section.key,
    layout: sp.layout ?? section.layout,
    imageUrl: (sp.imageUrl ?? section.imageUrl) || null,
    iconName: (sp.iconName ?? section.iconName) || null,
    ctaKey: (sp.ctaKey ?? section.ctaKey) || null,
    eyebrow: (sp.eyebrow ?? pt?.eyebrow) || null,
    heading: (sp.heading ?? pt?.heading) || null,
    subheading: (sp.subheading ?? pt?.subheading) || null,
    body: (sp.body ?? pt?.body) || null,
    items: section.items.map((item) => ({
      id: item.id,
      iconName: item.iconName,
      imageUrl: item.imageUrl,
      numberLabel: item.numberLabel,
      ctaKey: item.ctaKey,
      title: item.translations[0]?.title ?? "",
      body: item.translations[0]?.body ?? null,
    })),
  };

  return (
    <div className="bg-surface">
      <GenericPageSection section={data} locale="PT" />
    </div>
  );
}
