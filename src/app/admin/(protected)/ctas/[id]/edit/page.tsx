import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CtaForm } from "@/components/admin/CtaForm";
import { updateCta } from "../../actions";

export default async function EditCtaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cta = await prisma.cta.findUnique({ where: { id }, include: { translations: true } });
  if (!cta) notFound();

  return (
    <div>
      <AdminPageHeader title="Editar CTA" />
      <CtaForm cta={cta} action={updateCta.bind(null, id)} />
    </div>
  );
}
