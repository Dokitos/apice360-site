import Link from "next/link";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions";
import { auditActions, auditDate, auditEntities } from "@/lib/audit/filters";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { auditAvailable } from "@/lib/audit/availability";

const sources: Record<string, string> = { ADMIN: "Painel", PUBLIC: "Site público", SYSTEM: "Sistema", AUTH: "Acesso", WEBHOOK: "Integração de email" };
const dateFormat = new Intl.DateTimeFormat("pt-PT", { dateStyle: "short", timeStyle: "medium", timeZone: "Europe/Lisbon" });
const field = "min-w-0 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm";

export default async function LogsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdmin();
  if (!await auditAvailable()) return <div>
    <AdminPageHeader title="Registo de atividade" description="Histórico de alterações e acessos, reservado a administradores." />
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8">
      <h2 className="text-lg font-semibold">A aguardar ativação</h2>
      <p className="mt-2 max-w-xl text-sm text-on-surface-variant">O histórico ainda não foi ativado neste ambiente. Os registos começarão a ser guardados após a ativação. As funcionalidades atuais continuam disponíveis.</p>
    </div>
  </div>;
  const params = await searchParams;
  const value = (key: string) => typeof params[key] === "string" ? params[key].slice(0, 200) : "";
  const q = value("q").trim(), action = value("action"), entity = value("entity"), source = value("source");
  const from = value("from"), to = value("to");
  const page = Math.min(100000, Math.max(1, Math.floor(Number(value("page")) || 1)));
  const where: Prisma.AuditLogWhereInput = {
    ...(auditActions[action] ? { action } : {}), ...(entity ? { entity } : {}), ...(sources[source] ? { source } : {}),
    ...(auditDate(from) || auditDate(to, true) ? { createdAt: { gte: auditDate(from), lt: auditDate(to, true) } } : {}),
    ...(q ? { OR: ["actorName", "actorEmail", "entityId", "entity", "actorId"].map((key) => ({ [key]: { contains: q, mode: "insensitive" } })) } : {}),
  };
  const [total, entries, entities] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * 30, take: 30 }),
    prisma.auditLog.findMany({ distinct: ["entity"], select: { entity: true }, orderBy: { entity: "asc" } }),
  ]);
  const pages = Math.max(1, Math.ceil(total / 30));
  function pageHref(next: number) {
    const query = new URLSearchParams({ q, action, entity, source, from, to, page: String(next) });
    return `/admin/logs?${query}`;
  }
  return <div>
    <AdminPageHeader title="Registo de atividade" description="Histórico de alterações e acessos. Visível apenas para administradores." />
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5">
      <div><p className="text-xs uppercase tracking-wider text-on-surface-variant">Eventos encontrados</p><p className="mt-1 text-3xl font-semibold">{total.toLocaleString("pt-PT")}</p></div>
      <p className="max-w-lg text-xs leading-relaxed text-on-surface-variant">O histórico começa com a ativação desta funcionalidade e é preservado após eliminações. Palavras-passe, tokens e corpos de emails ficam ocultos. Horas de Lisboa; filtros de data em UTC.</p>
    </div>
    <form className="mb-6 grid gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 sm:grid-cols-2 xl:grid-cols-4">
      <label className="grid gap-1.5 text-xs">Pesquisar pessoa ou registo<input className={field} name="q" defaultValue={q} placeholder="Nome, email ou identificador" /></label>
      <label className="grid gap-1.5 text-xs">Ação<select className={field} name="action" defaultValue={action}><option value="">Todas as ações</option>{Object.entries(auditActions).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <label className="grid gap-1.5 text-xs">Área<select className={field} name="entity" defaultValue={entity}><option value="">Todas as áreas</option>{entities.map(({ entity }) => <option key={entity} value={entity}>{auditEntities[entity] ?? entity}</option>)}</select></label>
      <label className="grid gap-1.5 text-xs">Origem<select className={field} name="source" defaultValue={source}><option value="">Todas as origens</option>{Object.entries(sources).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
      <label className="grid gap-1.5 text-xs">Desde (UTC)<input className={field} type="date" name="from" defaultValue={from} /></label>
      <label className="grid gap-1.5 text-xs">Até (UTC, inclusive)<input className={field} type="date" name="to" defaultValue={to} /></label>
      <div className="flex items-end gap-3 sm:col-span-2"><button className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-on-primary">Filtrar</button><Link href="/admin/logs" className="px-2 py-2.5 text-sm text-on-surface-variant">Limpar filtros</Link></div>
    </form>
    <div className="space-y-3">
      {entries.length === 0 && <p className="rounded-2xl border border-outline-variant/20 p-8 text-center text-on-surface-variant">Nenhum evento encontrado para estes filtros.</p>}
      {entries.map((entry) => <details key={entry.id} className="group overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest">
        <summary className="cursor-pointer p-5 marker:text-primary">
          <span className="ml-2 inline-flex max-w-full flex-wrap items-center gap-x-4 gap-y-2 align-middle text-sm">
            <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${entry.action === "DELETE" || entry.action.includes("FAILURE") || entry.action.includes("BLOCKED") ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary"}`}>{auditActions[entry.action] ?? entry.action}</span>
            <span className="font-medium">{auditEntities[entry.entity] ?? entry.entity}</span>
            <span className="break-all text-on-surface-variant">{entry.actorName || entry.actorEmail || sources[entry.source] || "Sistema"}</span>
            <time className="text-xs text-on-surface-variant" dateTime={entry.createdAt.toISOString()}>{dateFormat.format(entry.createdAt)}</time>
          </span>
        </summary>
        <div className="border-t border-outline-variant/20 p-5 text-xs">
          <dl className="mb-4 grid gap-3 break-all sm:grid-cols-2 xl:grid-cols-3">
            <div><dt className="text-on-surface-variant">Pessoa</dt><dd className="mt-1">{entry.actorEmail ?? "—"}{entry.actorId ? ` · ${entry.actorId}` : ""}</dd></div>
            <div><dt className="text-on-surface-variant">Registo</dt><dd className="mt-1">{entry.entityId ?? "—"}</dd></div>
            <div><dt className="text-on-surface-variant">Origem / IP</dt><dd className="mt-1">{sources[entry.source] ?? entry.source} · {entry.ipAddress ?? "—"}</dd></div>
            <div className="sm:col-span-2"><dt className="text-on-surface-variant">Campos alterados</dt><dd className="mt-1">{entry.changedFields.join(", ") || "Evento de acesso ou ficheiro"}</dd></div>
            <div><dt className="text-on-surface-variant">Operação</dt><dd className="mt-1">{entry.correlationId ?? entry.id}</dd></div>
          </dl>
          {(entry.before !== null || entry.after !== null) && <div className="grid min-w-0 gap-4 xl:grid-cols-2">{[["Antes", entry.before], ["Depois", entry.after]].map(([label, data]) => <div key={String(label)} className="min-w-0"><p className="mb-2 font-semibold">{String(label)}</p><pre className="max-h-96 overflow-auto whitespace-pre-wrap break-all rounded-xl bg-surface-container-low p-4 text-xs leading-relaxed">{data === null ? "Sem registo" : JSON.stringify(data, null, 2)}</pre></div>)}</div>}
        </div>
      </details>)}
    </div>
    <nav aria-label="Paginação do histórico" className="mt-6 flex items-center justify-between gap-3 text-sm">
      {page > 1 ? <Link href={pageHref(page - 1)} className="rounded-xl border border-outline-variant/30 px-4 py-2">Anterior</Link> : <span />}
      <span className="text-on-surface-variant">Página {page} de {pages}</span>
      {page < pages ? <Link href={pageHref(page + 1)} className="rounded-xl border border-outline-variant/30 px-4 py-2">Seguinte</Link> : <span />}
    </nav>
  </div>;
}
