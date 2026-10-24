import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { AdminIcon as Icon } from "@/components/admin/AdminIcon";
import { deleteEmailAccount, refreshDomainStatus } from "../actions";

const ESTADO_DO_DOMINIO: Record<string, { texto: string; cor: string }> = {
  verified: { texto: "Verificado", cor: "text-green-700" },
  pending: { texto: "À espera do DNS", cor: "text-amber-700" },
  not_started: { texto: "Por verificar", cor: "text-on-surface-variant" },
  failed: { texto: "Falhou", cor: "text-red-700" },
  temporary_failure: { texto: "Falha temporária", cor: "text-amber-700" },
  not_found: { texto: "Domínio não está no Resend", cor: "text-red-700" },
};

export default async function EmailAccountsPage() {
  await requirePermission("email", "view");
  const contas = await prisma.emailAccount.findMany({ orderBy: [{ isDefault: "desc" }, { address: "asc" }] });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-headline-md">Contas de email</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Os endereços de onde o painel envia. Para receber, o domínio precisa também do registo MX apontado
            ao Resend.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <form action={refreshDomainStatus}>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg border border-outline-variant/40 px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container-high"
            >
              <Icon name="refresh" className="text-base" />
              Verificar domínios
            </button>
          </form>
          <Link
            href="/admin/email/contas/novo"
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase text-on-primary transition-transform hover:scale-105"
          >
            <Icon name="add" />
            Nova conta
          </Link>
        </div>
      </div>

      <DataTable
        rows={contas}
        getRowId={(c) => c.id}
        emptyMessage="Ainda não há contas. Cria a primeira para poder escrever mensagens."
        columns={[
          {
            header: "Endereço",
            render: (c) => (
              <span className="flex items-center gap-2 font-bold">
                {c.address}
                {c.isDefault ? (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-primary">
                    Por omissão
                  </span>
                ) : null}
              </span>
            ),
          },
          { header: "Nome", render: (c) => c.displayName },
          {
            header: "Domínio",
            render: (c) => {
              const estado = c.domainStatus ? ESTADO_DO_DOMINIO[c.domainStatus] : null;
              return (
                <span className={estado?.cor ?? "text-on-surface-variant"}>
                  {estado?.texto ?? c.domainStatus ?? "Por verificar"}
                </span>
              );
            },
          },
          {
            header: "Estado",
            render: (c) => (
              <span className={c.isActive ? "text-primary" : "text-on-surface-variant"}>
                {c.isActive ? "Ativa" : "Inativa"}
              </span>
            ),
          },
        ]}
        renderActions={(c) => (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/email/contas/${c.id}/editar`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Icon name="edit" className="text-lg" />
            </Link>
            <DeleteButton action={deleteEmailAccount.bind(null, c.id)} />
          </div>
        )}
      />
    </div>
  );
}
