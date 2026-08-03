import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { cn } from "@/lib/cn";
import { advanceLeadStatus, deleteLead } from "./actions";

const TYPES = [
  { value: "ALL", label: "Todos" },
  { value: "CONTACT", label: "Contacto" },
  { value: "BUDGET", label: "Orçamento" },
  { value: "ARCHITECT_PARTNERSHIP", label: "Parceria Arquiteto" },
] as const;

const STATUS_LABEL: Record<string, string> = {
  NEW: "Novo",
  CONTACTED: "Contactado",
  CLOSED: "Fechado",
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const activeType = TYPES.some((t) => t.value === type) ? (type as string) : "ALL";

  const leads = await prisma.leadSubmission.findMany({
    where: activeType === "ALL" ? {} : { type: activeType as "CONTACT" | "BUDGET" | "ARCHITECT_PARTNERSHIP" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <AdminPageHeader title="Leads" description="Contactos e pedidos de orçamento recebidos pelo site." />

      <div className="mb-6 flex gap-2 border-b border-outline-variant/20">
        {TYPES.map((t) => (
          <Link
            key={t.value}
            href={`/admin/leads?type=${t.value}`}
            className={cn(
              "px-4 py-2 font-mono text-label-mono uppercase tracking-widest transition-colors",
              activeType === t.value
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-on-surface",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <DataTable
        rows={leads}
        getRowId={(l) => l.id}
        emptyMessage="Sem leads nesta categoria."
        columns={[
          { header: "Nome", render: (l) => <span className="font-bold">{l.name}</span> },
          { header: "Email", render: (l) => l.email },
          { header: "Telefone", render: (l) => l.phone ?? "—" },
          {
            header: "Mensagem",
            render: (l) => <span className="line-clamp-2 max-w-xs text-xs text-on-surface-variant">{l.message ?? "—"}</span>,
          },
          {
            header: "Data",
            render: (l) => new Date(l.createdAt).toLocaleDateString("pt-PT"),
          },
          {
            header: "Estado",
            render: (l) => (
              <form action={advanceLeadStatus.bind(null, l.id, l.status)}>
                <button
                  type="submit"
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest transition-colors",
                    l.status === "NEW" && "bg-primary/20 text-primary",
                    l.status === "CONTACTED" && "bg-outline-variant/30 text-on-surface",
                    l.status === "CLOSED" && "bg-surface-container text-on-surface-variant",
                  )}
                  title="Clica para avançar o estado"
                >
                  {STATUS_LABEL[l.status]}
                </button>
              </form>
            ),
          },
        ]}
        renderActions={(l) => <DeleteButton action={deleteLead.bind(null, l.id)} />}
      />
    </div>
  );
}
