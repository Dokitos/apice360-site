import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { cn } from "@/lib/cn";
import { LeadStatsCards } from "@/components/admin/leads/LeadStatsCards";
import { LeadTypeBreakdown } from "@/components/admin/leads/LeadTypeBreakdown";
import { LeadsTrendChart } from "@/components/admin/leads/LeadsTrendChart";
import { LeadsFilterBar } from "@/components/admin/leads/LeadsFilterBar";
import { LeadsExportBar } from "@/components/admin/leads/LeadsExportBar";
import { LeadsTable } from "@/components/admin/leads/LeadsTable";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

const TYPES = [
  { value: "ALL", label: "Todos" },
  { value: "CONTACT", label: "Contacto" },
  { value: "BUDGET", label: "Orçamento" },
  { value: "ARCHITECT_PARTNERSHIP", label: "Parceria Arquiteto" },
] as const;

const STATUSES = [
  { value: "ALL", label: "Todos os Estados" },
  { value: "NEW", label: "Novo" },
  { value: "CONTACTED", label: "Contactado" },
  { value: "QUALIFIED", label: "Qualificado" },
  { value: "WON", label: "Ganho" },
  { value: "LOST", label: "Perdido" },
] as const;

type SearchParams = {
  type?: string;
  status?: string;
  q?: string;
  from?: string;
  to?: string;
  page?: string;
  sort?: string;
};

function buildQuery(sp: SearchParams, overrides: Partial<SearchParams>) {
  const merged: SearchParams = { ...sp, ...overrides };
  const params = new URLSearchParams();
  if (merged.type && merged.type !== "ALL") params.set("type", merged.type);
  if (merged.status && merged.status !== "ALL") params.set("status", merged.status);
  if (merged.q) params.set("q", merged.q);
  if (merged.from) params.set("from", merged.from);
  if (merged.to) params.set("to", merged.to);
  if (merged.sort && merged.sort !== "desc") params.set("sort", merged.sort);
  if (merged.page && merged.page !== "1") params.set("page", merged.page);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function getLeadStats() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const fourteenDaysAgo = new Date(startOfToday);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);

  const [total, byStatus, byType, thisWeek, thisMonth, last14] = await Promise.all([
    prisma.leadSubmission.count(),
    prisma.leadSubmission.groupBy({ by: ["status"], _count: true }),
    prisma.leadSubmission.groupBy({ by: ["type"], _count: true }),
    prisma.leadSubmission.count({ where: { createdAt: { gte: startOfWeek } } }),
    prisma.leadSubmission.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.leadSubmission.findMany({
      where: { createdAt: { gte: fourteenDaysAgo } },
      select: { createdAt: true },
    }),
  ]);

  const statusMap: Record<string, number> = {};
  for (const row of byStatus) statusMap[row.status] = row._count;
  const typeMap: Record<string, number> = {};
  for (const row of byType) typeMap[row.type] = row._count;

  const won = statusMap.WON ?? 0;
  const lost = statusMap.LOST ?? 0;
  const closedCount = won + lost;
  const conversionRate = closedCount > 0 ? Math.round((won / closedCount) * 1000) / 10 : 0;

  const dayBuckets: { date: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - i);
    dayBuckets.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  const bucketIndex = new Map(dayBuckets.map((b, idx) => [b.date, idx]));
  for (const lead of last14) {
    const key = lead.createdAt.toISOString().slice(0, 10);
    const idx = bucketIndex.get(key);
    if (idx !== undefined) dayBuckets[idx].count += 1;
  }

  return { total, statusMap, typeMap, thisWeek, thisMonth, conversionRate, dayBuckets };
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const activeType = TYPES.some((t) => t.value === sp.type) ? (sp.type as string) : "ALL";
  const activeStatus = STATUSES.some((s) => s.value === sp.status) ? (sp.status as string) : "ALL";
  const q = (sp.q ?? "").trim();
  const sort = sp.sort === "asc" ? "asc" : "desc";
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const from = sp.from ? new Date(`${sp.from}T00:00:00`) : undefined;
  const to = sp.to ? new Date(`${sp.to}T23:59:59.999`) : undefined;

  const where = {
    ...(activeType !== "ALL" ? { type: activeType as "CONTACT" | "BUDGET" | "ARCHITECT_PARTNERSHIP" } : {}),
    ...(activeStatus !== "ALL"
      ? { status: activeStatus as "NEW" | "CONTACTED" | "QUALIFIED" | "WON" | "LOST" }
      : {}),
    ...(from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
            { message: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [leads, total, stats] = await Promise.all([
    prisma.leadSubmission.findMany({
      where,
      orderBy: { createdAt: sort },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { assignedTo: { select: { id: true, name: true } } },
    }),
    prisma.leadSubmission.count({ where }),
    getLeadStats(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const exportQuery = buildQuery(sp, {});

  return (
    <div>
      <AdminPageHeader
        title="Leads"
        description="Contactos e pedidos de orçamento recebidos pelo site. Gere, filtra, exporta e acompanha cada lead até ao fecho."
      />

      <LeadStatsCards stats={stats} />

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LeadsTrendChart dayBuckets={stats.dayBuckets} />
        </div>
        <LeadTypeBreakdown typeMap={stats.typeMap} total={stats.total} />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-outline-variant/20">
        <div className="flex gap-2">
          {TYPES.map((t) => (
            <Link
              key={t.value}
              href={`/admin/leads${buildQuery(sp, { type: t.value, page: "1" })}`}
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
        <LeadsExportBar baseQuery={exportQuery} />
      </div>

      <LeadsFilterBar
        currentType={activeType}
        currentStatus={activeStatus}
        q={sp.q ?? ""}
        from={sp.from ?? ""}
        to={sp.to ?? ""}
        statuses={STATUSES}
      />

      <p className="mb-3 text-xs text-on-surface-variant">
        {total} lead{total === 1 ? "" : "s"} encontrado{total === 1 ? "" : "s"}
        {activeStatus !== "ALL" || activeType !== "ALL" || q || from || to ? " (com filtros aplicados)" : ""}.
      </p>

      <LeadsTable
        leads={leads.map((l) => ({
          id: l.id,
          refNumber: l.refNumber,
          type: l.type,
          name: l.name,
          email: l.email,
          phone: l.phone,
          message: l.message,
          sourcePage: l.sourcePage,
          locale: l.locale,
          status: l.status,
          createdAt: l.createdAt.toISOString(),
          assignedTo: l.assignedTo,
        }))}
        sort={sort}
        sortHref={buildQuery(sp, { sort: sort === "asc" ? "desc" : "asc" })}
      />

      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Link
            href={`/admin/leads${buildQuery(sp, { page: String(Math.max(1, page - 1)) })}`}
            aria-disabled={page <= 1}
            className={cn(
              "rounded-lg border border-outline-variant/40 px-4 py-2 text-sm transition-colors",
              page <= 1 ? "pointer-events-none opacity-40" : "hover:border-primary hover:text-primary",
            )}
          >
            Anterior
          </Link>
          <span className="px-3 text-sm text-on-surface-variant">
            Página {page} de {totalPages}
          </span>
          <Link
            href={`/admin/leads${buildQuery(sp, { page: String(Math.min(totalPages, page + 1)) })}`}
            aria-disabled={page >= totalPages}
            className={cn(
              "rounded-lg border border-outline-variant/40 px-4 py-2 text-sm transition-colors",
              page >= totalPages ? "pointer-events-none opacity-40" : "hover:border-primary hover:text-primary",
            )}
          >
            Seguinte
          </Link>
        </div>
      ) : null}
    </div>
  );
}
