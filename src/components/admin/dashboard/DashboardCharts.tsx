import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
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
  const conteudo = (
    <Card className="flex h-full flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <Icon name={icon} className={cn("text-2xl", tone === "alert" ? "text-red-600" : "text-primary")} />
        {href ? <Icon name="arrow_forward" className="text-base text-on-surface-variant/40" /> : null}
      </div>
      <div>
        <p className="font-heading text-headline-md text-on-surface">{value}</p>
        <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">{label}</p>
        {hint ? <p className="mt-1 text-xs text-on-surface-variant/70">{hint}</p> : null}
      </div>
    </Card>
  );

  return href ? (
    <Link href={href} className="h-full">
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
  const total = buckets.reduce((soma, b) => soma + b.count, 0);

  return (
    <Card className="flex h-full flex-col gap-4 p-6">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">{title}</p>
        <span className="font-heading text-lg font-bold text-primary">{total}</span>
      </div>

      {total === 0 ? (
        <p className="py-10 text-center text-sm text-on-surface-variant">{emptyMessage}</p>
      ) : (
        <>
          <div className="flex h-40 items-end gap-1">
            {buckets.map((bucket) => {
              const altura = Math.max(Math.round((bucket.count / max) * 100), bucket.count > 0 ? 6 : 2);
              const data = new Date(`${bucket.date}T00:00:00`);
              return (
                <div
                  key={bucket.date}
                  className="group relative flex h-full flex-1 flex-col justify-end"
                  title={`${data.toLocaleDateString("pt-PT", { day: "2-digit", month: "short" })}: ${bucket.count}`}
                >
                  <div
                    className="w-full rounded-t-sm bg-primary/75 transition-colors group-hover:bg-primary"
                    style={{ height: `${altura}%` }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between font-mono text-[10px] text-on-surface-variant/60">
            <span>{rotuloDeData(buckets[0]?.date)}</span>
            <span>{rotuloDeData(buckets[buckets.length - 1]?.date)}</span>
          </div>
        </>
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
      <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">{title}</p>
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
