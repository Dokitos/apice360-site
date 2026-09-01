import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { deleteLpPriceTier } from "./actions";

export default async function LandingPageAdminPage() {
  await requirePermission("landing_page", "view");
  const tiers = await prisma.lpPriceTier.findMany({
    orderBy: { order: "asc" },
    include: { translations: true },
  });

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title="Landing Page (/lp)"
        description="Escalões de preço do simulador. O texto e as imagens da página editam-se em Secções de Página → Landing Page."
        newHref="/admin/landing-page/new"
        newLabel="Novo Escalão"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex flex-col gap-3 p-6">
          <Icon name="dashboard_customize" className="text-2xl text-primary" />
          <div>
            <h3 className="font-heading text-base font-bold">Textos e imagens</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              Hero, vantagens, confiança e formulário da LP.
            </p>
          </div>
          <Link
            href="/admin/page-sections/LP"
            className="mt-auto inline-flex w-fit items-center gap-2 text-sm font-bold uppercase text-primary hover:underline"
          >
            Editar secções
            <Icon name="arrow_forward" className="text-base" />
          </Link>
        </Card>

        <Card className="flex flex-col gap-3 p-6">
          <Icon name="search" className="text-2xl text-primary" />
          <div>
            <h3 className="font-heading text-base font-bold">SEO da /lp</h3>
            <p className="mt-1 text-sm text-on-surface-variant">Título e descrição para o Google e anúncios.</p>
          </div>
          <Link
            href="/admin/seo/LP"
            className="mt-auto inline-flex w-fit items-center gap-2 text-sm font-bold uppercase text-primary hover:underline"
          >
            Editar SEO
            <Icon name="arrow_forward" className="text-base" />
          </Link>
        </Card>

        <Card className="flex flex-col gap-3 p-6">
          <Icon name="open_in_new" className="text-2xl text-primary" />
          <div>
            <h3 className="font-heading text-base font-bold">Ver a página</h3>
            <p className="mt-1 text-sm text-on-surface-variant">Abre a landing page como o visitante a vê.</p>
          </div>
          <a
            href="/lp"
            target="_blank"
            rel="noreferrer"
            className="mt-auto inline-flex w-fit items-center gap-2 text-sm font-bold uppercase text-primary hover:underline"
          >
            Abrir /lp
            <Icon name="arrow_forward" className="text-base" />
          </a>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 font-heading text-headline-md">Escalões de Preço do Simulador</h2>
        <DataTable
          rows={tiers}
          getRowId={(t) => t.id}
          emptyMessage="Ainda não há escalões — o simulador só aparece na LP quando existir pelo menos um."
          columns={[
            {
              header: "Escalão",
              render: (t) => (
                <span className="flex items-center gap-2 font-bold">
                  {t.translations.find((x) => x.locale === "PT")?.label ?? t.key}
                  {t.isHighlighted ? (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-primary">
                      Destaque
                    </span>
                  ) : null}
                </span>
              ),
            },
            {
              header: "Preço / m²",
              render: (t) => <span className="font-bold text-primary">{t.pricePerM2} €</span>,
            },
            {
              header: "Exemplo (150 m²)",
              render: (t) => `${(t.pricePerM2 * 150).toLocaleString("pt-PT")} € + IVA`,
            },
            { header: "Ordem", render: (t) => t.order },
            {
              header: "Estado",
              render: (t) => (
                <span className={t.isActive ? "text-primary" : "text-on-surface-variant"}>
                  {t.isActive ? "Ativo" : "Inativo"}
                </span>
              ),
            },
          ]}
          renderActions={(t) => (
            <div className="flex items-center justify-end gap-2">
              <Link
                href={`/admin/landing-page/${t.id}/edit`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Icon name="edit" className="text-lg" />
              </Link>
              <DeleteButton action={deleteLpPriceTier.bind(null, t.id)} />
            </div>
          )}
        />
      </div>
    </div>
  );
}
