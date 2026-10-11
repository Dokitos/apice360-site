import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LpSimulatorFieldForm } from "@/components/admin/LpSimulatorFieldForm";
import { updateLpSimulatorField } from "../../../actions";

export default async function EditLpSimulatorFieldPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const field = await prisma.lpSimulatorField.findUnique({ where: { id }, include: { translations: true } });
  if (!field) notFound();

  return (
    <div>
      <AdminPageHeader
        title="Editar Campo do Simulador"
        description="O que mudares aqui muda o formulário da /lp e o que fica gravado em cada lead."
      />
      <LpSimulatorFieldForm field={field} action={updateLpSimulatorField.bind(null, id)} />
    </div>
  );
}
