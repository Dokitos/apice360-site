import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";

type Stats = {
  total: number;
  statusMap: Record<string, number>;
  thisWeek: number;
  thisMonth: number;
  conversionRate: number;
};

export function LeadStatsCards({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Total de Leads", value: stats.total, icon: "contact_mail" },
    { label: "Novos", value: stats.statusMap.NEW ?? 0, icon: "fiber_new" },
    {
      label: "Em Contacto",
      value: (stats.statusMap.CONTACTED ?? 0) + (stats.statusMap.QUALIFIED ?? 0),
      icon: "forum",
    },
    { label: "Ganhos", value: stats.statusMap.WON ?? 0, icon: "verified" },
    { label: "Perdidos", value: stats.statusMap.LOST ?? 0, icon: "cancel" },
    { label: "Taxa de Conversão", value: `${stats.conversionRate}%`, icon: "trending_up" },
    { label: "Esta Semana", value: stats.thisWeek, icon: "date_range" },
    { label: "Este Mês", value: stats.thisMonth, icon: "calendar_month" },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="flex flex-col gap-3 p-5">
          <div className="flex items-center justify-between">
            <Icon name={card.icon} className="text-xl text-primary" />
          </div>
          <div>
            <p className="font-heading text-headline-md text-on-surface">{card.value}</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">{card.label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
