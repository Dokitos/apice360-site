import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PartnerForm } from "@/components/admin/PartnerForm";
import { updatePartner } from "../../actions";

export default async function EditPartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partner = await prisma.partner.findUnique({ where: { id } });
  if (!partner) notFound();

  return (
    <div>
      <AdminPageHeader title="Editar Parceiro" />
      <PartnerForm partner={partner} action={updatePartner.bind(null, id)} />
    </div>
  );
}
