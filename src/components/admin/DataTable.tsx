import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Column<T> = {
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  renderActions?: (row: T) => ReactNode;
  emptyMessage?: string;
};

export function DataTable<T>({
  columns,
  rows,
  getRowId,
  renderActions,
  emptyMessage = "Sem registos.",
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-10 text-center text-on-surface-variant">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-outline-variant/20">
      <table className="w-full text-left text-sm">
        <thead className="bg-surface-container-low text-on-surface-variant">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className={cn(
                  "px-4 py-3 font-mono text-label-mono uppercase tracking-widest",
                  col.className,
                )}
              >
                {col.header}
              </th>
            ))}
            {renderActions ? <th className="px-4 py-3" /> : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-outline-variant/10 bg-surface-container-lowest">
          {rows.map((row) => (
            <tr key={getRowId(row)} className="transition-colors hover:bg-surface-container-low/60">
              {columns.map((col) => (
                <td key={col.header} className={cn("px-4 py-3 align-middle", col.className)}>
                  {col.render(row)}
                </td>
              ))}
              {renderActions ? (
                <td className="px-4 py-3 text-right align-middle">{renderActions(row)}</td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
