import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ServiceFeatureForm } from "@/components/admin/ServiceFeatureForm";
import { updateServiceFeature } from "../../../../actions";

export default async function EditServiceFeaturePage({
  params,
}: {
  params: Promise<{ type: string; featureId: string }>;
}) {
  const { type, featureId } = await params;
  if (type !== "LSF" && type !== "REMODELACAO") notFound();

  const feature = await prisma.serviceFeature.findUnique({
    where: { id: featureId },
    include: { translations: true },
  });
  if (!feature) notFound();

  return (
    <div>
      <AdminPageHeader title="Editar Feature" />
      <ServiceFeatureForm feature={feature} action={updateServiceFeature.bind(null, type, featureId)} />
    </div>
  );
}
