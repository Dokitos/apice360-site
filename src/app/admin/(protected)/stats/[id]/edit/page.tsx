import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatForm } from "@/components/admin/StatForm";
import { updateStat } from "../../actions";

export default async function EditStatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const stat = await prisma.stat.findUnique({ where: { id }, include: { translations: true } });
  if (!stat) notFound();

  return (
    <div>
      <AdminPageHeader title="Editar Estatística" />
      <StatForm stat={stat} action={updateStat.bind(null, id)} />
    </div>
  );
}
