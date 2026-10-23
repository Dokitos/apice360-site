import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { DataTable } from "@/components/admin/DataTable";
import { Icon } from "@/components/ui/Icon";

const ORIGENS: Record<string, string> = {
  rodape: "Rodapé do site",
  simulador: "Simulador da landing page",
};

export default async function NewsletterPage() {
  await requirePermission("email", "view");
  const [subscritores, ativos] = await Promise.all([
    prisma.newsletterSubscriber.findMany({ orderBy: { createdAt: "desc" }, take: 200 }),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-headline-md">Newsletter</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Quem pediu para receber novidades, pelo rodapé do site ou por ter aceitado no simulador.
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-bold text-primary">
          <Icon name="mark_email_read" className="text-base" />
          {ativos} {ativos === 1 ? "inscrito" : "inscritos"}
        </span>
      </div>

      <DataTable
        rows={subscritores}
        getRowId={(s) => s.id}
        emptyMessage="Ainda não há inscrições."
        columns={[
          { header: "Email", render: (s) => <span className="font-bold">{s.email}</span> },
          { header: "Nome", render: (s) => s.name ?? "—" },
          { header: "Origem", render: (s) => (s.source ? (ORIGENS[s.source] ?? s.source) : "—") },
          { header: "Idioma", render: (s) => s.locale },
          {
            header: "Data",
            render: (s) => s.createdAt.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" }),
          },
          {
            header: "Estado",
            render: (s) => (
              <span className={s.isActive ? "text-primary" : "text-on-surface-variant"}>
                {s.isActive ? "Inscrito" : "Cancelado"}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
