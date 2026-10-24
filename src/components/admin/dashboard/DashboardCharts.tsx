import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { AdminIcon as Icon } from "@/components/admin/AdminIcon";
import { cn } from "@/lib/cn";

/**
 * Gráficos do painel, desenhados com CSS.
 *
 * Sem biblioteca de gráficos de propósito: são barras e percentagens, saem
 * do servidor já prontas e não acrescentam nada ao que o browser tem de
 * descarregar — o mesmo critério do gráfico que já existia nas Leads.
 */

export function StatCard({
  label,
  value,
  icon,
  href,
  hint,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: string;
  href?: string;
  hint?: string;
  tone?: "default" | "alert";
}) {
  const color = icon === "contact_mail" ? "blue" : icon === "target" ? "green" : icon === "mail" ? "orange" : "slate";
  const conteudo = (
    <Card className="admin-stat-card">
      <span className={cn("admin-icon-disc", `admin-tone-${color}`)}>
        <Icon name={icon} className="text-2xl" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-slate-600">{label}</p>
        <p className="mt-2 text-[2rem] font-semibold leading-none tracking-tight text-slate-950">{value}</p>
        {hint ? <p className="mt-2 text-xs leading-relaxed text-slate-500">{hint}</p> : null}
      </div>
      {tone === "alert" && Number(value) > 0 ? <span className="sr-only">Requer atenção</span> : null}
    </Card>
  );

  return href ? (
    <Link href={href} className="admin-stat-link block h-full">
      {conteudo}
    </Link>
  ) : (
    conteudo
  );
}

export type DayBucket = { date: string; count: number };

/** Série diária em barras. O eixo só mostra algumas datas para não se amontoar. */
export function DailyBarChart({
  title,
  buckets,
  emptyMessage = "Ainda sem registos neste período.",
}: {
  title: string;
  buckets: DayBucket[];
  emptyMessage?: string;
}) {
  const max = Math.max(1, ...buckets.map((b) => b.count));
  const scaleMax = max <= 4 ? 4 : Math.ceil(max / 4) * 4;
  const total = buckets.reduce((sum, b) => sum + b.count, 0);
  const ticks = Array.from({ length: 5 }, (_, i) => scaleMax - (scaleMax / 4) * i);
  const labelIndexes = [...new Set([0, Math.floor((buckets.length - 1) / 3), Math.floor(2 * (buckets.length - 1) / 3), buckets.length - 1])].filter((i) => i >= 0);

  return (
    <Card className="flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="admin-card-title text-slate-900">Contactos recebidos</h2>
          <p className="mt-1 text-sm text-slate-500">{title.includes("30") ? "Últimos 30 dias" : title}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-semibold tracking-tight text-slate-900">{total}</span>
          <p className="mt-1 text-xs text-slate-500">no período</p>
        </div>
      </div>
      {total === 0 ? (
        <div className="flex min-h-56 flex-1 flex-col items-center justify-center gap-3 text-center">
          <span className="admin-icon-disc admin-tone-slate"><Icon name="monitoring" className="text-2xl" /></span>
          <p className="text-sm text-slate-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="mt-7" role="img" aria-label={`${title}: ${total} contactos. ${buckets.map((b) => `${rotuloDeData(b.date)}: ${b.count}`).join("; ")}`}>
          <div className="relative ml-8 h-44 sm:h-48">
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between" aria-hidden="true">
              {ticks.map((tick) => (
                <div key={tick} className="relative border-t border-dashed border-slate-200">
                  <span className="absolute -left-8 -top-2 w-6 text-right text-[11px] tabular-nums text-slate-400">{tick}</span>
                </div>
              ))}
            </div>
            <div className="relative flex h-full items-end gap-1.5 sm:gap-2">
              {buckets.map((bucket) => (
                <div key={bucket.date} className="group relative flex h-full min-w-0 flex-1 items-end"
                  title={`${rotuloDeData(bucket.date)}: ${bucket.count}`}>
                  <div className="admin-chart-bar w-full rounded-t-[3px]" style={{ height: `${bucket.count / scaleMax * 100}%` }} />
                </div>
              ))}
            </div>
          </div>
          <div className="ml-8 mt-3 flex justify-between text-[11px] tabular-nums text-slate-500" aria-hidden="true">
            {labelIndexes.map((i) => <span key={i}>{rotuloDeData(buckets[i]?.date)}</span>)}
          </div>
        </div>
      )}
    </Card>
  );
}

export type Breakdown = { label: string; count: number; href?: string };

/** Repartição por categoria, em barras horizontais com percentagem. */
export function BreakdownBars({
  title,
  rows,
  emptyMessage = "Sem dados.",
}: {
  title: string;
  rows: Breakdown[];
  emptyMessage?: string;
}) {
  const total = rows.reduce((soma, r) => soma + r.count, 0);

  return (
    <Card className="flex h-full flex-col gap-4 p-6">
      <p className="admin-card-title text-on-surface">{title}</p>
      {total === 0 ? (
        <p className="py-8 text-center text-sm text-on-surface-variant">{emptyMessage}</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((row) => {
            const percentagem = Math.round((row.count / total) * 100);
            const corpo = (
              <>
                <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                  <span className="truncate">{row.label}</span>
                  <span className="shrink-0 font-mono text-xs text-on-surface-variant">
                    {row.count} · {percentagem}%
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface-container">
                  <div className="h-full rounded-full bg-primary/80" style={{ width: `${percentagem}%` }} />
                </div>
              </>
            );
            return (
              <li key={row.label}>
                {row.href ? (
                  <Link href={row.href} className="block transition-opacity hover:opacity-80">
                    {corpo}
                  </Link>
                ) : (
                  corpo
                )}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

function rotuloDeData(iso: string | undefined): string {
  if (!iso) return "";
  return new Date(`${iso}T00:00:00`).toLocaleDateString("pt-PT", { day: "2-digit", month: "short" });
}
