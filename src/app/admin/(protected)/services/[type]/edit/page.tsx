import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/ui/Icon";
import { upsertService, deleteServiceFeature } from "../../actions";

const LABELS: Record<string, string> = {
  LSF: "Construção em LSF",
  REMODELACAO: "Remodelação Total",
};

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type } = await params;
  if (type !== "LSF" && type !== "REMODELACAO") notFound();

  const service = await prisma.service.findUnique({
    where: { type },
    include: {
      translations: true,
      features: { orderBy: { order: "asc" }, include: { translations: true } },
    },
  });

  return (
    <div>
      <AdminPageHeader title={`Serviço: ${LABELS[type]}`} />
      <ServiceForm service={service ?? undefined} action={upsertService.bind(null, type)} />

      {service ? (
        <div className="mt-16">
          <AdminPageHeader
            title="Features"
            description="Diferenciais listados nesta linha de serviço."
            newHref={`/admin/services/${type}/features/new`}
            newLabel="Nova Feature"
          />
          <DataTable
            rows={service.features}
            getRowId={(f) => f.id}
            emptyMessage="Ainda não há features."
            columns={[
              {
                header: "Título (PT)",
                render: (f) => f.translations.find((t) => t.locale === "PT")?.title ?? "—",
              },
              { header: "Ícone", render: (f) => f.iconName ?? "—" },
              { header: "Ordem", render: (f) => f.order },
            ]}
            renderActions={(f) => (
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/admin/services/${type}/features/${f.id}/edit`}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  <Icon name="edit" className="text-lg" />
                </Link>
                <DeleteButton action={deleteServiceFeature.bind(null, type, f.id)} />
              </div>
            )}
          />
        </div>
      ) : null}
    </div>
  );
}
