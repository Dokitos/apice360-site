import { Card } from "@/components/ui/Card";

type DayBucket = { date: string; count: number };

const WEEKDAY_PT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function LeadsTrendChart({ dayBuckets }: { dayBuckets: DayBucket[] }) {
  const max = Math.max(1, ...dayBuckets.map((b) => b.count));

  return (
    <Card className="flex h-full flex-col gap-4 p-6">
      <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
        Leads Recebidas — Últimos 14 Dias
      </p>
      <div className="flex h-36 items-end gap-1.5">
        {dayBuckets.map((bucket) => {
          const heightPct = Math.max(Math.round((bucket.count / max) * 100), bucket.count > 0 ? 6 : 2);
          const d = new Date(`${bucket.date}T00:00:00`);
          const label = `${WEEKDAY_PT[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
          return (
            <div
              key={bucket.date}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
              title={`${label}: ${bucket.count} lead(s)`}
            >
              <span className="text-[10px] text-on-surface-variant">{bucket.count > 0 ? bucket.count : ""}</span>
              <div
                className="w-full rounded-t-sm bg-primary/80 transition-all hover:bg-primary"
                style={{ height: `${heightPct}%` }}
              />
              <span className="hidden text-[9px] text-on-surface-variant/60 sm:block">{d.getDate()}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
