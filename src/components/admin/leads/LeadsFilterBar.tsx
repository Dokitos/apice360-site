"use client";

import { useRef } from "react";
import { Icon } from "@/components/ui/Icon";

type Status = { value: string; label: string };

type LeadsFilterBarProps = {
  currentType: string;
  currentStatus: string;
  q: string;
  from: string;
  to: string;
  statuses: readonly Status[];
};

const fieldClasses =
  "rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-sm text-on-surface outline-none transition-colors focus:border-primary";

export function LeadsFilterBar({ currentType, currentStatus, q, from, to, statuses }: LeadsFilterBarProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const hasFilters = currentStatus !== "ALL" || q || from || to;

  return (
    <form ref={formRef} method="GET" className="mb-6 flex flex-wrap items-end gap-3">
      <input type="hidden" name="type" value={currentType} />

      <label className="flex w-full flex-col gap-1.5 sm:w-64">
        <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Pesquisar</span>
        <div className="relative">
          <Icon
            name="search"
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-base text-on-surface-variant"
          />
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Nome, email, telefone ou mensagem..."
            className={`${fieldClasses} w-full pl-8`}
          />
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Estado</span>
        <select
          name="status"
          defaultValue={currentStatus}
          className={fieldClasses}
          onChange={() => formRef.current?.requestSubmit()}
        >
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">De</span>
        <input type="date" name="from" defaultValue={from} className={fieldClasses} />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Até</span>
        <input type="date" name="to" defaultValue={to} className={fieldClasses} />
      </label>

      <button
        type="submit"
        className="rounded-lg bg-primary px-5 py-2 text-sm font-bold uppercase text-on-primary transition-transform hover:scale-105"
      >
        Filtrar
      </button>

      {hasFilters ? (
        <a
          href={`/admin/leads${currentType !== "ALL" ? `?type=${currentType}` : ""}`}
          className="flex items-center gap-1 text-sm text-on-surface-variant transition-colors hover:text-primary"
        >
          <Icon name="close" className="text-base" />
          Limpar filtros
        </a>
      ) : null}
    </form>
  );
}
