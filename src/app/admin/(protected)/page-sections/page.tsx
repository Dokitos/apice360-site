import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

const PAGES = [
  { key: "HOME", label: "Home" },
  { key: "QUEM_SOMOS", label: "Quem Somos" },
  { key: "SERVICOS", label: "Serviços" },
  { key: "CONTACTO", label: "Contacto" },
  { key: "AREA_ARQUITETO", label: "Área do Arquiteto" },
] as const;

export default async function PageSectionsPage() {
  await requirePermission("page_sections", "view");
  const counts = await prisma.pageSection.groupBy({
    by: ["page"],
    _count: true,
  });

  return (
    <div>
      <AdminPageHeader
        title="Secções de Página"
        description="Blocos de conteúdo reutilizáveis: Home, Quem Somos, Serviços e Contacto."
      />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PAGES.map((p) => {
          const count = counts.find((c) => c.page === p.key)?._count ?? 0;
          return (
            <Card key={p.key} className="flex flex-col gap-4 p-8">
              <Icon name="dashboard_customize" className="text-3xl text-primary" />
              <div>
                <h3 className="font-heading text-headline-md">{p.label}</h3>
                <p className="mt-1 text-sm text-on-surface-variant">{count} secções configuradas</p>
              </div>
              <Link
                href={`/admin/page-sections/${p.key}`}
                className="mt-2 inline-flex w-fit items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold uppercase text-on-primary transition-transform hover:scale-105"
              >
                Gerir Secções
              </Link>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
