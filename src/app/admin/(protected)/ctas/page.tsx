import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/ui/Icon";
import { deleteCta } from "./actions";

export default async function CtasPage() {
  const ctas = await prisma.cta.findMany({
    orderBy: { key: "asc" },
    include: { translations: true },
  });

  return (
    <div>
      <AdminPageHeader
        title="CTAs"
        description="Textos e destinos de todos os botões de ação do site (WhatsApp, orçamento, etc.)."
        newHref="/admin/ctas/new"
        newLabel="Novo CTA"
      />
      <DataTable
        rows={ctas}
        getRowId={(c) => c.id}
        emptyMessage="Ainda não há CTAs configurados."
        columns={[
          { header: "Chave", render: (c) => <code className="text-xs text-on-surface-variant">{c.key}</code> },
          {
            header: "Texto (PT)",
            render: (c) => <span className="font-bold">{c.translations.find((t) => t.locale === "PT")?.label ?? "—"}</span>,
          },
          {
            header: "Destino",
            render: (c) => (
              <span className="block max-w-[220px] truncate text-xs text-on-surface-variant" title={c.url}>
                {c.url}
              </span>
            ),
          },
          {
            header: "Estado",
            render: (c) => (
              <span className={c.isActive ? "text-primary" : "text-on-surface-variant"}>
                {c.isActive ? "Ativo" : "Inativo"}
              </span>
            ),
          },
        ]}
        renderActions={(c) => (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/ctas/${c.id}/edit`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Icon name="edit" className="text-lg" />
            </Link>
            <DeleteButton action={deleteCta.bind(null, c.id)} />
          </div>
        )}
      />
    </div>
  );
}
