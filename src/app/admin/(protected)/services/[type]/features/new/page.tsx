import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ServiceFeatureForm } from "@/components/admin/ServiceFeatureForm";
import { createServiceFeature } from "../../../actions";

export default async function NewServiceFeaturePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;

  const service = await prisma.service.findUnique({ where: { type } });
  if (!service) notFound();

  return (
    <div>
      <AdminPageHeader title="Nova Feature" />
      <ServiceFeatureForm action={createServiceFeature.bind(null, type, service.id)} />
    </div>
  );
}
