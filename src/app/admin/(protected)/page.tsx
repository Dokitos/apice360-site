import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import {
  StatCard,
  DailyBarChart,
  BreakdownBars,
  type DayBucket,
} from "@/components/admin/dashboard/DashboardCharts";

const DIAS = 30;

const TIPOS_DE_LEAD: Record<string, string> = {
  CONTACT: "Contacto",
  BUDGET: "Orçamento / simulador",
  ARCHITECT_PARTNERSHIP: "Parceria de arquitetura",
};

const ESTADOS_DE_LEAD: Record<string, string> = {
  NEW: "Novas",
  CONTACTED: "Contactadas",
  QUALIFIED: "Qualificadas",
  WON: "Ganhas",
  LOST: "Perdidas",
};

/** Dias do período, incluindo os que não tiveram nada — senão o gráfico mente sobre o ritmo. */
function bucketsVazios(dias: number): DayBucket[] {
  const hoje = new Date();
  return Array.from({ length: dias }, (_, i) => {
    const d = new Date(hoje);
    d.setDate(hoje.getDate() - (dias - 1 - i));
    return { date: d.toISOString().slice(0, 10), count: 0 };
  });
}

export default async function AdminDashboardPage() {
  const desde = new Date();
  desde.setDate(desde.getDate() - (DIAS - 1));
  desde.setHours(0, 0, 0, 0);

  const inicioDoMes = new Date();
  inicioDoMes.setDate(1);
  inicioDoMes.setHours(0, 0, 0, 0);

  const [
    leadsNovas,
    leadsDoMes,
    leadsGanhas,
    leadsTotal,
    comentariosPendentes,
    artigosPublicados,
    projetos,
    parceiros,
    testemunhos,
    paginasPersonalizadas,
    emailsPorLer,
    subscritores,
    comConsentimento,
    leadsRecentes,
    leadsDoPeriodo,
    porTipo,
    porEstado,
    porOrigem,
  ] = await Promise.all([
    prisma.leadSubmission.count({ where: { status: "NEW" } }),
    prisma.leadSubmission.count({ where: { createdAt: { gte: inicioDoMes } } }),
    prisma.leadSubmission.count({ where: { status: "WON" } }),
    prisma.leadSubmission.count(),
    prisma.blogComment.count({ where: { status: "PENDING" } }),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.portfolioProject.count(),
    prisma.partner.count({ where: { isActive: true } }),
    prisma.testimonial.count({ where: { isActive: true } }),
    prisma.customPage.count({ where: { isPublished: true } }),
    prisma.emailMessage.count({ where: { folder: "INBOX", isRead: false } }).catch(() => 0),
    prisma.newsletterSubscriber.count({ where: { isActive: true } }).catch(() => 0),
    prisma.leadSubmission.count({ where: { marketingConsent: true } }).catch(() => 0),
    prisma.leadSubmission.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: { refNumber: true, name: true, email: true, type: true, status: true, createdAt: true },
    }),
    prisma.leadSubmission.findMany({
      where: { createdAt: { gte: desde } },
      select: { createdAt: true },
    }),
    prisma.leadSubmission.groupBy({ by: ["type"], _count: { _all: true } }),
    prisma.leadSubmission.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.leadSubmission.groupBy({
      by: ["sourcePage"],
      _count: { _all: true },
      orderBy: { _count: { sourcePage: "desc" } },
      take: 6,
    }),
  ]);

  const definicoes = await prisma.siteSettings.findUnique({
    where: { id: "singleton" },
    select: { gaMeasurementId: true },
  });

  const porDia = new Map(bucketsVazios(DIAS).map((b) => [b.date, b]));
  for (const lead of leadsDoPeriodo) {
    const chave = lead.createdAt.toISOString().slice(0, 10);
    const bucket = porDia.get(chave);
    if (bucket) bucket.count += 1;
  }

  const taxaDeConversao = leadsTotal > 0 ? Math.round((leadsGanhas / leadsTotal) * 100) : 0;
  // O identificador vive nas Definições do Site; a variável de ambiente
  // continua a servir de alternativa para quem o pôs lá primeiro.
  const gaId = definicoes?.gaMeasurementId || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-headline-lg">Dashboard</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          O que entrou pelo site nos últimos {DIAS} dias e o estado do que está por tratar.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Leads por tratar"
          value={leadsNovas}
          icon="contact_mail"
          href="/admin/leads"
          tone={leadsNovas > 0 ? "alert" : "default"}
        />
        <StatCard label="Leads este mês" value={leadsDoMes} icon="trending_up" href="/admin/leads" />
        <StatCard
          label="Taxa de conversão"
          value={`${taxaDeConversao}%`}
          icon="target"
          hint={`${leadsGanhas} ganhas em ${leadsTotal}`}
        />
        <StatCard
          label="Emails por ler"
          value={emailsPorLer}
          icon="mail"
          href="/admin/email"
          tone={emailsPorLer > 0 ? "alert" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailyBarChart
            title={`Leads recebidas — últimos ${DIAS} dias`}
            buckets={[...porDia.values()]}
            emptyMessage="Nenhuma lead neste período."
          />
        </div>
        <BreakdownBars
          title="Por estado"
          rows={porEstado
            .map((e) => ({
              label: ESTADOS_DE_LEAD[e.status] ?? e.status,
              count: e._count._all,
              href: `/admin/leads?status=${e.status}`,
            }))
            .sort((a, b) => b.count - a.count)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BreakdownBars
          title="Por tipo de pedido"
          rows={porTipo
            .map((t) => ({ label: TIPOS_DE_LEAD[t.type] ?? t.type, count: t._count._all }))
            .sort((a, b) => b.count - a.count)}
        />
        <BreakdownBars
          title="Páginas que mais geram contactos"
          rows={porOrigem
            .filter((o) => o.sourcePage)
            .map((o) => ({ label: o.sourcePage ?? "—", count: o._count._all }))}
          emptyMessage="Ainda sem origem registada."
        />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Subscritores da newsletter" value={subscritores} icon="mark_email_read" />
        <StatCard
          label="Leads que aceitam marketing"
          value={comConsentimento}
          icon="campaign"
          hint="Marcaram a caixa no simulador"
        />
        <StatCard
          label="Comentários pendentes"
          value={comentariosPendentes}
          icon="forum"
          href="/admin/blog/comments"
          tone={comentariosPendentes > 0 ? "alert" : "default"}
        />
        <StatCard label="Artigos publicados" value={artigosPublicados} icon="article" href="/admin/blog/posts" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
              Últimos contactos
            </p>
            <Link href="/admin/leads" className="text-xs font-bold uppercase text-primary hover:underline">
              Ver todas
            </Link>
          </div>
          {leadsRecentes.length === 0 ? (
            <p className="py-8 text-center text-sm text-on-surface-variant">Ainda não há contactos.</p>
          ) : (
            <ul className="divide-y divide-outline-variant/10">
              {leadsRecentes.map((lead) => (
                <li key={lead.refNumber}>
                  <Link
                    href={`/admin/leads/${lead.refNumber}`}
                    className="flex items-center justify-between gap-3 py-3 transition-colors hover:text-primary"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold">{lead.name}</span>
                      <span className="block truncate text-xs text-on-surface-variant">
                        {TIPOS_DE_LEAD[lead.type] ?? lead.type} · {lead.email}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                      {lead.createdAt.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="flex flex-col gap-4 p-6">
          <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
            Google Analytics
          </p>
          {gaId ? (
            <>
              <p className="text-sm text-on-surface-variant">
                O site está a enviar visitas para a propriedade{" "}
                <code className="rounded bg-surface-container px-1.5 py-0.5 text-xs">{gaId}</code> desde que o
                visitante aceita os cookies.
              </p>
              <p className="text-sm text-on-surface-variant">
                Os números de visitas não aparecem aqui porque o identificador só serve para{" "}
                <strong>enviar</strong> dados. Para os <strong>ler</strong> e desenhar neste painel é preciso
                ligar a Google Analytics Data API: uma conta de serviço no Google Cloud, com acesso de leitura
                à propriedade, e o respetivo ficheiro de credenciais. Diz-me quando tiveres isso e ligo os
                gráficos de visitas, origens de tráfego e páginas mais vistas aqui ao lado dos contactos.
              </p>
              <a
                href="https://analytics.google.com/"
                target="_blank"
                rel="noreferrer"
                className="mt-auto inline-flex w-fit items-center gap-2 rounded-lg border border-outline-variant/40 px-4 py-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
              >
                <Icon name="open_in_new" className="text-base" />
                Abrir o Google Analytics
              </a>
            </>
          ) : (
            <p className="text-sm text-on-surface-variant">
              Ainda não há identificador do Google Analytics configurado. Podes indicá-lo em Definições do
              Site para o site começar a registar visitas.
            </p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Projetos no portfólio" value={projetos} icon="photo_library" href="/admin/portfolio" />
        <StatCard label="Parceiros ativos" value={parceiros} icon="handshake" href="/admin/partners" />
        <StatCard label="Testemunhos ativos" value={testemunhos} icon="format_quote" href="/admin/testimonials" />
        <StatCard
          label="Páginas personalizadas"
          value={paginasPersonalizadas}
          icon="note_add"
          href="/admin/pages"
        />
      </div>
    </div>
  );
}
