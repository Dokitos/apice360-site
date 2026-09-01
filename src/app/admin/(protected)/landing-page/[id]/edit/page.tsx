import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LpPriceTierForm } from "@/components/admin/LpPriceTierForm";
import { updateLpPriceTier } from "../../actions";

export default async function EditLpPriceTierPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tier = await prisma.lpPriceTier.findUnique({ where: { id }, include: { translations: true } });
  if (!tier) notFound();

  return (
    <div>
      <AdminPageHeader
        title="Editar Escalão de Preço"
        description="Alterar o preço por m² muda imediatamente as estimativas mostradas na /lp."
      />
      <LpPriceTierForm tier={tier} action={updateLpPriceTier.bind(null, id)} />
    </div>
  );
}
