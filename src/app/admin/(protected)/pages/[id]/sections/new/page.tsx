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
  const page = await prisma.customPage.findUnique({ where: { id } });
  if (!page) notFound();

  return (
    <div>
      <AdminPageHeader title="Nova Secção" />
      <PageSectionForm action={createCustomPageSection.bind(null, id)} />
    </div>
  );
}
