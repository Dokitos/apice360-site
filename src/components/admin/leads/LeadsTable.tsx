"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { bulkDeleteLeads, bulkSetStatus, deleteLead, setLeadStatus } from "@/app/admin/(protected)/leads/actions";

type LeadRow = {
  id: string;
  type: "CONTACT" | "BUDGET" | "ARCHITECT_PARTNERSHIP";
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  sourcePage: string | null;
  locale: "PT" | "EN";
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "WON" | "LOST";
  createdAt: string;
  assignedTo: { id: string; name: string } | null;
};

type LeadsTableProps = {
  leads: LeadRow[];
  sort: "asc" | "desc";
  sortHref: string;
};

const TYPE_LABEL: Record<string, string> = {
  CONTACT: "Contacto",
  BUDGET: "Orçamento",
  ARCHITECT_PARTNERSHIP: "Parceria",
};

const TYPE_BADGE: Record<string, string> = {
  CONTACT: "bg-outline-variant/30 text-on-surface",
  BUDGET: "bg-primary/20 text-primary",
  ARCHITECT_PARTNERSHIP: "bg-surface-container text-on-surface-variant",
};

const STATUS_LABEL: Record<string, string> = {
  NEW: "Novo",
  CONTACTED: "Contactado",
  QUALIFIED: "Qualificado",
  WON: "Ganho",
  LOST: "Perdido",
};

const STATUS_CLASS: Record<string, string> = {
  NEW: "bg-primary/20 text-primary",
  CONTACTED: "bg-blue-500/15 text-blue-400",
  QUALIFIED: "bg-amber-500/15 text-amber-400",
  WON: "bg-emerald-500/15 text-emerald-400",
  LOST: "bg-red-500/15 text-red-400",
};

const STATUS_OPTIONS = Object.keys(STATUS_LABEL);

function whatsappHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "").replace(/^00/, "+");
  return `https://wa.me/${digits.replace("+", "")}`;
}

export function LeadsTable({ leads, sort, sortHref }: LeadsTableProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [bulkStatus, setBulkStatus] = useState("NEW");

  const allSelected = leads.length > 0 && leads.every((l) => selected.has(l.id));

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(leads.map((l) => l.id)));
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleStatusChange(id: string, status: string) {
    startTransition(async () => {
      await setLeadStatus(id, status);
      router.refresh();
    });
  }

  function handleDelete(id: string) {
    if (!window.confirm("Tens a certeza que queres eliminar esta lead? Esta ação não pode ser desfeita.")) return;
    startTransition(async () => {
      await deleteLead(id);
      router.refresh();
    });
  }

  function handleBulkStatus() {
    if (selected.size === 0) return;
    startTransition(async () => {
      await bulkSetStatus(Array.from(selected), bulkStatus);
      setSelected(new Set());
      router.refresh();
    });
  }

  function handleBulkDelete() {
    if (selected.size === 0) return;
    if (!window.confirm(`Eliminar ${selected.size} lead(s) selecionada(s)? Esta ação não pode ser desfeita.`)) return;
    startTransition(async () => {
      await bulkDeleteLeads(Array.from(selected));
      setSelected(new Set());
      router.refresh();
    });
  }

  if (leads.length === 0) {
    return (
      <div className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-10 text-center text-on-surface-variant">
        Sem leads para os filtros selecionados.
      </div>
    );
  }

  return (
    <div className={cn(isPending && "opacity-60 transition-opacity")}>
      {selected.size > 0 ? (
        <div className="mb-3 flex flex-wrap items-center gap-3 rounded-lg border border-primary/40 bg-primary/5 px-4 py-3">
          <span className="text-sm font-bold text-on-surface">{selected.size} selecionada(s)</span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-1.5 text-sm"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleBulkStatus}
            disabled={isPending}
            className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold uppercase text-on-primary transition-transform hover:scale-105"
          >
            Aplicar Estado
          </button>
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={isPending}
            className="ml-auto flex items-center gap-1 rounded-lg border border-red-500/40 px-4 py-1.5 text-xs font-bold uppercase text-red-400 transition-colors hover:bg-red-500/10"
          >
            <Icon name="delete" className="text-sm" />
            Eliminar Selecionadas
          </button>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-lg border border-outline-variant/20">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-container-low text-on-surface-variant">
            <tr>
              <th className="w-10 px-4 py-3">
                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="h-4 w-4 accent-primary" />
              </th>
              <th className="px-4 py-3 font-mono text-label-mono uppercase tracking-widest">Nome</th>
              <th className="px-4 py-3 font-mono text-label-mono uppercase tracking-widest">Contacto</th>
              <th className="px-4 py-3 font-mono text-label-mono uppercase tracking-widest">Tipo</th>
              <th className="px-4 py-3 font-mono text-label-mono uppercase tracking-widest">Mensagem</th>
              <th className="px-4 py-3 font-mono text-label-mono uppercase tracking-widest">Responsável</th>
              <th className="px-4 py-3 font-mono text-label-mono uppercase tracking-widest">
                <Link href={`/admin/leads${sortHref}`} className="flex items-center gap-1 hover:text-primary">
                  Data
                  <Icon name={sort === "asc" ? "arrow_upward" : "arrow_downward"} className="text-sm" />
                </Link>
              </th>
              <th className="px-4 py-3 font-mono text-label-mono uppercase tracking-widest">Estado</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10 bg-surface-container-lowest">
            {leads.map((lead) => (
              <tr key={lead.id} className="transition-colors hover:bg-surface-container-low/60">
                <td className="px-4 py-3 align-middle">
                  <input
                    type="checkbox"
                    checked={selected.has(lead.id)}
                    onChange={() => toggleOne(lead.id)}
                    className="h-4 w-4 accent-primary"
                  />
                </td>
                <td className="px-4 py-3 align-middle">
                  <Link href={`/admin/leads/${lead.id}`} className="font-bold hover:text-primary">
                    {lead.name}
                  </Link>
                </td>
                <td className="px-4 py-3 align-middle">
                  <div className="flex flex-col gap-1 text-xs">
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-on-surface-variant hover:text-primary">
                      <Icon name="mail" className="text-sm" />
                      {lead.email}
                    </a>
                    {lead.phone ? (
                      <div className="flex items-center gap-2">
                        <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-on-surface-variant hover:text-primary">
                          <Icon name="call" className="text-sm" />
                          {lead.phone}
                        </a>
                        <a
                          href={whatsappHref(lead.phone)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Abrir WhatsApp"
                          className="text-on-surface-variant hover:text-primary"
                        >
                          <Icon name="chat" className="text-sm" />
                        </a>
                      </div>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 align-middle">
                  <span className={cn("rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest", TYPE_BADGE[lead.type])}>
                    {TYPE_LABEL[lead.type]}
                  </span>
                </td>
                <td className="px-4 py-3 align-middle">
                  <span className="line-clamp-2 max-w-xs text-xs text-on-surface-variant">{lead.message ?? "—"}</span>
                </td>
                <td className="px-4 py-3 align-middle text-xs text-on-surface-variant">
                  {lead.assignedTo?.name ?? "—"}
                </td>
                <td className="px-4 py-3 align-middle text-xs text-on-surface-variant">
                  {new Date(lead.createdAt).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  <br />
                  {new Date(lead.createdAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                </td>
                <td className="px-4 py-3 align-middle">
                  <select
                    value={lead.status}
                    disabled={isPending}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    className={cn(
                      "rounded-full border-0 px-3 py-1 text-xs font-bold uppercase tracking-widest outline-none",
                      STATUS_CLASS[lead.status],
                    )}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s} className="bg-surface-container-low text-on-surface">
                        {STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-right align-middle">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/leads/${lead.id}`}
                      title="Ver detalhe"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <Icon name="visibility" className="text-lg" />
                    </Link>
                    <button
                      type="button"
                      title="Eliminar"
                      onClick={() => handleDelete(lead.id)}
                      disabled={isPending}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
                    >
                      <Icon name="delete" className="text-lg" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
