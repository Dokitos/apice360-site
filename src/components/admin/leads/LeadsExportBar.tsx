import { Icon } from "@/components/ui/Icon";

const FORMATS: { format: string; label: string; icon: string }[] = [
  { format: "csv", label: "CSV", icon: "csv" },
  { format: "xlsx", label: "Excel", icon: "table_chart" },
  { format: "pdf", label: "PDF", icon: "picture_as_pdf" },
];

export function LeadsExportBar({ baseQuery }: { baseQuery: string }) {
  const separator = baseQuery ? "&" : "?";

  return (
    <div className="flex items-center gap-2 pb-3">
      <span className="hidden font-mono text-[10px] uppercase tracking-widest text-on-surface-variant sm:inline">
        Exportar:
      </span>
      {FORMATS.map((f) => (
        <a
          key={f.format}
          href={`/api/admin/leads/export${baseQuery}${separator}format=${f.format}`}
          className="flex items-center gap-1.5 rounded-lg border border-outline-variant/40 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
        >
          <Icon name={f.icon} className="text-base" />
          {f.label}
        </a>
      ))}
    </div>
  );
}
