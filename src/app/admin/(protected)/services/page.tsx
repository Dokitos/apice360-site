import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

const SERVICE_TYPES = [
  { type: "LSF" as const, label: "Construção em LSF" },
  { type: "REMODELACAO" as const, label: "Remodelação Total" },
];

export default async function ServicesPage() {
  const services = await prisma.service.findMany({ include: { translations: true } });

  return (
    <div>
      <AdminPageHeader
        title="Serviços"
        description="Conteúdo das duas linhas de serviço: LSF e Remodelação Total."
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {SERVICE_TYPES.map(({ type, label }) => {
          const service = services.find((s) => s.type === type);
          const title = service?.translations.find((t) => t.locale === "PT")?.title;
          return (
            <Card key={type} className="flex flex-col gap-4 p-8">
              <Icon name="engineering" className="text-3xl text-primary" />
              <div>
                <h3 className="font-heading text-headline-md">{label}</h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {title ?? "Ainda não configurado."}
                </p>
              </div>
              <Link
                href={`/admin/services/${type}/edit`}
                className="mt-2 inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase text-on-primary transition-transform hover:scale-105"
              >
                {service ? "Editar" : "Configurar"}
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
