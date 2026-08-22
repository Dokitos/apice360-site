import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PageSectionForm } from "@/components/admin/PageSectionForm";
import { createCustomPageSection } from "../../../../page-sections/actions";

export default async function NewCustomPageSectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [page, ctasRaw] = await Promise.all([
    prisma.customPage.findUnique({ where: { id } }),
    prisma.cta.findMany({
      orderBy: { key: "asc" },
      select: { key: true, translations: { where: { locale: "PT" }, select: { label: true } } },
    }),
  ]);
  if (!page) notFound();
  const ctas = ctasRaw.map((c) => ({ key: c.key, label: c.translations[0]?.label ?? c.key }));

  return (
    <div>
      <AdminPageHeader title="Nova Secção" />
      <PageSectionForm action={createCustomPageSection.bind(null, id)} ctas={ctas} />
    </div>
  );
}
