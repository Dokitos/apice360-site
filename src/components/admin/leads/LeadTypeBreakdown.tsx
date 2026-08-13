import { Card } from "@/components/ui/Card";

const TYPE_LABEL: Record<string, string> = {
  CONTACT: "Contacto",
  BUDGET: "Orçamento",
  ARCHITECT_PARTNERSHIP: "Parceria Arquiteto",
};

const TYPE_ORDER = ["CONTACT", "BUDGET", "ARCHITECT_PARTNERSHIP"];

export function LeadTypeBreakdown({ typeMap, total }: { typeMap: Record<string, number>; total: number }) {
  return (
    <Card className="flex flex-col gap-4 p-6">
      <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">Leads por Tipo</p>
      <div className="flex flex-1 flex-col justify-center gap-4">
        {TYPE_ORDER.map((key) => {
          const count = typeMap[key] ?? 0;
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <div key={key}>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-on-surface">{TYPE_LABEL[key]}</span>
                <span className="font-bold text-on-surface-variant">
                  {count} <span className="text-on-surface-variant/60">({pct}%)</span>
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
