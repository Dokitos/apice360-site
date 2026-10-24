import Link from "next/link";
import { auth } from "@/auth";
import { getViewableResources } from "@/lib/permissions";
import type { Resource } from "@/lib/resources";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { AdminIcon as Icon } from "@/components/admin/AdminIcon";
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
  const session = await auth();
  const resources = session?.user ? await getViewableResources(session.user) : [];
  const canView = (resource: string) => resources === null || resources.includes(resource as Resource);

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
        <h1 className="font-heading text-headline-lg">Resumo</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Acompanhe os contactos e as tarefas do seu site.
        </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-lg border border-outline bg-white px-4 py-2 text-sm text-on-surface-variant">
          <Icon name="calendar_today" className="text-lg" />
          {new Date().toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Lisbon" })}
        </span>
      </div>

      {canView("leads") && leadsNovas > 0 ? (
        <Link href="/admin/leads?status=NEW" className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-5 py-4 text-sm">
          <Icon name="notifications" className="text-xl text-primary" />
          <span className="flex-1 font-medium">{leadsNovas} {leadsNovas === 1 ? "contacto aguarda" : "contactos aguardam"} tratamento.</span>
          <span className="inline-flex items-center gap-2 font-semibold text-primary">Ver contactos <Icon name="arrow_forward" className="text-lg" /></span>
        </Link>
      ) : null}

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          label="Novos contactos"
          hint="Por tratar · todos os períodos"
          value={leadsNovas}
          icon="contact_mail"
          href="/admin/leads?status=NEW"
          tone={leadsNovas > 0 ? "alert" : "default"}
        />
        <StatCard label="Contactos este mês" hint="Desde o primeiro dia do mês" value={leadsDoMes} icon="trending_up" href="/admin/leads" />
        <StatCard
          label="Taxa de fecho"
          value={`${taxaDeConversao}%`}
          icon="target"
          hint={`${leadsGanhas} ganhos em ${leadsTotal} · histórico`}
        />
        <StatCard
          label="Emails por ler"
          hint="Na caixa de entrada"
          value={emailsPorLer}
          icon="mail"
          href="/admin/email"
          tone={emailsPorLer > 0 ? "alert" : "default"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DailyBarChart
            title={`Contactos recebidos — últimos ${DIAS} dias`}
            buckets={[...porDia.values()]}
            emptyMessage="Nenhum contacto neste período."
          />
        </div>
        <Card className="flex h-full flex-col gap-4 p-6">
          <div>
            <h2 className="admin-card-title">Precisa de atenção</h2>
            <p className="mt-1 text-sm text-slate-500">Pendentes em todos os períodos</p>
          </div>
          <ul className="divide-y divide-outline">
            {[
              { resource: "leads", href: "/admin/leads?status=NEW", label: "Contactos por tratar", value: leadsNovas, icon: "contact_mail", color: "orange" },
              { resource: "email", href: "/admin/email", label: "Emails por ler", value: emailsPorLer, icon: "mail", color: "slate" },
              { resource: "blog_comments", href: "/admin/blog/comments", label: "Comentários pendentes", value: comentariosPendentes, icon: "forum", color: "blue" },
            ].filter((item) => canView(item.resource)).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="flex items-center gap-3 rounded-lg py-4 transition-colors hover:bg-surface-container-low">
                  <span className={`admin-icon-disc admin-tone-${item.color}`}><Icon name={item.icon} className="text-xl" /></span>
                  <span className="text-2xl font-semibold tracking-tight text-slate-900">{item.value}</span>
                  <span className="min-w-0 flex-1 text-[13px] leading-snug text-slate-600">{item.label}</span>
                  <Icon name="chevron_right" className="text-lg text-on-surface-variant" />
                </Link>
              </li>
            ))}
          </ul>

        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="min-w-0 overflow-hidden xl:col-span-2">
          <div className="flex items-center justify-between gap-3 px-5 py-5 sm:px-6">
            <h2 className="admin-card-title">Contactos recentes</h2>
            <Link href="/admin/leads" className="inline-flex items-center gap-2 text-xs font-medium text-primary hover:underline">
              Ver todos <Icon name="arrow_forward" className="text-base" />
            </Link>
          </div>
          {leadsRecentes.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-slate-500">Ainda não há contactos.</p>
          ) : (
            <div className="overflow-x-auto" role="region" aria-label="Contactos recentes" tabIndex={0}>
              <table className="admin-recent-table w-full text-left">
                <thead><tr>
                  <th scope="col">Nome</th>
                  <th scope="col" className="hidden sm:table-cell">Pedido</th>
                  <th scope="col">Estado</th>
                  <th scope="col" className="hidden lg:table-cell">Recebido</th>
                  <th scope="col"><span className="sr-only">Abrir contacto</span></th>
                </tr></thead>
                <tbody>
                  {leadsRecentes.map((lead) => (
                    <tr key={lead.refNumber}>
                      <td>
                        <Link href={`/admin/leads/${lead.refNumber}`} className="block max-w-44 truncate font-medium text-slate-800 hover:text-primary">{lead.name}</Link>
                        <p className="mt-1 max-w-44 truncate text-xs text-slate-500">{lead.email}</p>
                      </td>
                      <td className="hidden text-slate-500 sm:table-cell">{lead.type === "BUDGET" ? "Orçamento" : TIPOS_DE_LEAD[lead.type] ?? lead.type}</td>
                      <td>
                        <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          lead.status === "NEW" ? "bg-blue-50 text-blue-700" : lead.status === "CONTACTED" ? "bg-amber-50 text-amber-800" : lead.status === "QUALIFIED" || lead.status === "WON" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                        }`}>{({ NEW: "Novo", CONTACTED: "Contactado", QUALIFIED: "Qualificado", WON: "Ganho", LOST: "Perdido" })[lead.status] ?? lead.status}</span>
                      </td>
                      <td className="hidden whitespace-nowrap text-xs text-slate-500 lg:table-cell">{lead.createdAt.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}</td>
                      <td><Link href={`/admin/leads/${lead.refNumber}`} aria-label={`Abrir contacto de ${lead.name}`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-800"><Icon name="arrow_forward" className="text-base" /></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <Card className="flex flex-col gap-4 p-6">
          <h2 className="admin-card-title">Acesso rápido</h2>
          <p className="text-sm text-on-surface-variant">Continue a gerir o conteúdo do site.</p>
          <div className="grid gap-3">
            {[
              { resource: "blog_posts", href: "/admin/blog/posts", label: "Gerir artigos", icon: "article" },
              { resource: "portfolio", href: "/admin/portfolio", label: "Gerir portfólio", icon: "photo_library" },
              { resource: "page_sections", href: "/admin/page-sections", label: "Gerir páginas e secções", icon: "dashboard_customize" },
            ].filter((item) => canView(item.resource)).map((item) => (
              <Link key={item.href} href={item.href} className="admin-quick-action text-sm font-medium">
                <Icon name={item.icon} className="text-xl text-on-surface-variant" />
                <span className="flex-1">{item.label}</span>
                <Icon name="chevron_right" className="text-lg text-on-surface-variant" />
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div>
        <Card className="flex flex-col gap-4 p-6">
          <p className="admin-card-title text-on-surface">
            Google Analytics
          </p>
          {gaId ? (
            <>
              <p className="text-sm text-on-surface-variant">
                Propriedade{" "}
                <code className="rounded bg-surface-container px-1.5 py-0.5 text-xs">{gaId}</code> a registar
                visitas. Para mostrar os números aqui é preciso ligar a Google Analytics Data API.
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

      <div>
        <h2 className="text-lg font-semibold">Análise e conteúdo</h2>
        <p className="mt-1 text-sm text-on-surface-variant">Distribuições históricas e estado dos conteúdos publicados.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <BreakdownBars
          title="Por estado · histórico"
          rows={porEstado
            .map((e) => ({
              label: ESTADOS_DE_LEAD[e.status] ?? e.status,
              count: e._count._all,
              href: `/admin/leads?status=${e.status}`,
            }))
            .sort((a, b) => b.count - a.count)}
        />
        <BreakdownBars
          title="Por tipo de pedido · histórico"
          rows={porTipo
            .map((t) => ({ label: TIPOS_DE_LEAD[t.type] ?? t.type, count: t._count._all }))
            .sort((a, b) => b.count - a.count)}
        />
        <BreakdownBars
          title="Origem dos contactos · histórico"
          rows={porOrigem
            .filter((o) => o.sourcePage)
            .map((o) => ({ label: o.sourcePage ?? "—", count: o._count._all }))}
          emptyMessage="Ainda sem origem registada."
        />
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
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

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
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
