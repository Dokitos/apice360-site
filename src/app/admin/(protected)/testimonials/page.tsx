import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/ui/Icon";
import { deleteTestimonial } from "./actions";

export default async function TestimonialsPage() {
  await requirePermission("testimonials", "view");
  const testimonials = await prisma.testimonial.findMany({
    orderBy: { order: "asc" },
    include: { translations: true },
  });

  return (
    <div>
      <AdminPageHeader
        title="Testemunhos"
        description="Depoimentos de clientes exibidos no carrossel de confiança."
        newHref="/admin/testimonials/new"
        newLabel="Novo Testemunho"
      />
      <DataTable
        rows={testimonials}
        getRowId={(t) => t.id}
        emptyMessage="Ainda não há testemunhos."
        columns={[
          { header: "Cliente", render: (t) => <span className="font-bold">{t.authorName}</span> },
          { header: "Localização", render: (t) => t.location ?? "—" },
          {
            header: "Depoimento (PT)",
            render: (t) => (
              <span className="line-clamp-1 max-w-xs text-xs text-on-surface-variant">
                {t.translations.find((tr) => tr.locale === "PT")?.quote ?? "—"}
              </span>
            ),
          },
          {
            header: "Home",
            render: (t) => (t.showOnHome ? "Sim" : "Não"),
          },
        ]}
        renderActions={(t) => (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/testimonials/${t.id}/edit`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Icon name="edit" className="text-lg" />
            </Link>
            <DeleteButton action={deleteTestimonial.bind(null, t.id)} />
          </div>
        )}
      />
    </div>
  );
}
