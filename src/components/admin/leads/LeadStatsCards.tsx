import { StatCard } from "@/components/admin/dashboard/DashboardCharts";

type Stats = {
  total: number;
  statusMap: Record<string, number>;
  thisWeek: number;
  thisMonth: number;
  conversionRate: number;
};

export function LeadStatsCards({ stats }: { stats: Stats }) {
  const cards = [
    { label: "Total de contactos", value: stats.total, icon: "contact_mail" },
    { label: "Novos", value: stats.statusMap.NEW ?? 0, icon: "fiber_new" },
    {
      label: "Em Contacto",
      value: (stats.statusMap.CONTACTED ?? 0) + (stats.statusMap.QUALIFIED ?? 0),
      icon: "forum",
    },
    { label: "Ganhos", value: stats.statusMap.WON ?? 0, icon: "verified" },
    { label: "Perdidos", value: stats.statusMap.LOST ?? 0, icon: "cancel" },
    { label: "Taxa de fecho", value: `${stats.conversionRate}%`, icon: "trending_up" },
    { label: "Esta Semana", value: stats.thisWeek, icon: "date_range" },
    { label: "Este Mês", value: stats.thisMonth, icon: "calendar_month" },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.label} label={card.label} value={card.value} icon={card.icon} />
      ))}
    </div>
  );
}
