import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Card } from "@/components/ui/Card";
import { AdminIcon as Icon } from "@/components/admin/AdminIcon";
import { deleteLpPriceTier, deleteLpSimulatorField } from "./actions";
import { LP_FIELD_TYPE_LABELS, type LpFieldTypeValue } from "@/lib/lp-simulator";

export default async function LandingPageAdminPage() {
  await requirePermission("landing_page", "view");
  const [tiers, fields] = await Promise.all([
    prisma.lpPriceTier.findMany({
      orderBy: { order: "asc" },
      include: { translations: true },
    }),
    prisma.lpSimulatorField.findMany({
      orderBy: [{ step: "asc" }, { order: "asc" }],
      include: { translations: { where: { locale: "PT" } } },
    }),
  ]);

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

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-heading text-headline-md">Campos do Formulário do Simulador</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              As perguntas que o visitante responde antes de ver a estimativa. A resposta de cada campo ativo
              fica gravada na lead, em Leads.
            </p>
          </div>
          <Link
            href="/admin/landing-page/campos/new"
            className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase text-on-primary transition-transform hover:scale-105"
          >
            <Icon name="add" />
            Novo Campo
          </Link>
        </div>
        <DataTable
          rows={fields}
          getRowId={(f) => f.id}
          emptyMessage="Ainda não há campos gravados — o simulador está a usar o formulário de origem. Corre o script de arranque ou cria os campos aqui."
          columns={[
            {
              header: "Pergunta",
              render: (f) => (
                <span className="flex items-center gap-2 font-bold">
                  {f.translations[0]?.label ?? f.key}
                  {f.isSystem ? (
                    <span
                      title="Necessário ao funcionamento do simulador"
                      className="rounded-full bg-surface-container px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant"
                    >
                      Sistema
                    </span>
                  ) : null}
                </span>
              ),
            },
            { header: "Chave", render: (f) => <code className="text-xs text-on-surface-variant">{f.key}</code> },
            { header: "Tipo", render: (f) => LP_FIELD_TYPE_LABELS[f.type as LpFieldTypeValue] ?? f.type },
            { header: "Passo", render: (f) => `${f.step} · ${f.order}` },
            { header: "Obrigatório", render: (f) => (f.isRequired ? "Sim" : "Não") },
            {
              header: "Estado",
              render: (f) => (
                <span className={f.isActive ? "text-primary" : "text-on-surface-variant"}>
                  {f.isActive ? "Ativo" : "Inativo"}
                </span>
              ),
            },
          ]}
          renderActions={(f) => (
            <div className="flex items-center justify-end gap-2">
              <Link
                href={`/admin/landing-page/campos/${f.id}/edit`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Icon name="edit" className="text-lg" />
              </Link>
              {f.isSystem ? null : <DeleteButton action={deleteLpSimulatorField.bind(null, f.id)} />}
            </div>
          )}
        />
      </div>
    </div>
  );
}
