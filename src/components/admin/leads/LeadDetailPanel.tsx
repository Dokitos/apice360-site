"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import {
  assignLead,
  deleteLead,
  logCallAttempt,
  logEmailSent,
  setLeadStatus,
  updateLeadNotes,
} from "@/app/admin/(protected)/leads/actions";

type Lead = {
  id: string;
  type: "CONTACT" | "BUDGET" | "ARCHITECT_PARTNERSHIP";
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  sourcePage: string | null;
  locale: "PT" | "EN";
  status: "NEW" | "CONTACTED" | "QUALIFIED" | "WON" | "LOST";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  assignedTo: { id: string; name: string } | null;
};

type Activity = {
  id: string;
  type: "STATUS_CHANGE" | "NOTE" | "CALL_LOGGED" | "EMAIL_LOGGED" | "ASSIGNMENT";
  note: string | null;
  createdAt: string;
  userName: string | null;
};

const TYPE_LABEL: Record<string, string> = {
  CONTACT: "Contacto",
  BUDGET: "Orçamento",
  ARCHITECT_PARTNERSHIP: "Parceria Arquiteto",
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

const ACTIVITY_ICON: Record<string, string> = {
  STATUS_CHANGE: "sync_alt",
  NOTE: "sticky_note_2",
  CALL_LOGGED: "call",
  EMAIL_LOGGED: "mail",
  ASSIGNMENT: "person",
};

function whatsappHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, "").replace(/^00/, "+");
  return `https://wa.me/${digits.replace("+", "")}`;
}

export function LeadDetailPanel({ lead, activities, users }: { lead: Lead; activities: Activity[]; users: { id: string; name: string }[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(lead.notes ?? "");
  const notesDirty = notes.trim() !== (lead.notes ?? "").trim();

  function run(action: () => Promise<void>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  function handleDelete() {
    if (!window.confirm("Tens a certeza que queres eliminar esta lead? Esta ação não pode ser desfeita.")) return;
    startTransition(async () => {
      await deleteLead(lead.id);
      router.push("/admin/leads");
    });
  }

  return (
    <div className={cn(isPending && "opacity-70 transition-opacity")}>
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="font-heading text-headline-lg">{lead.name}</h1>
            <span className={cn("rounded-full px-3 py-1 text-xs font-bold uppercase tracking-widest", STATUS_CLASS[lead.status])}>
              {STATUS_LABEL[lead.status]}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant">
            {TYPE_LABEL[lead.type]} · Recebida em{" "}
            {new Date(lead.createdAt).toLocaleString("pt-PT", { dateStyle: "long", timeStyle: "short" })}
            {lead.sourcePage ? (
              <>
                {" "}
                · Origem: <code className="text-xs">{lead.sourcePage}</code>
              </>
            ) : null}
            {" "}· Idioma: {lead.locale}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="flex items-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 text-sm font-bold uppercase text-red-400 transition-colors hover:bg-red-500/10"
        >
          <Icon name="delete" className="text-lg" />
          Eliminar Lead
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card className="flex flex-col gap-4 p-6">
            <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">Contacto</p>
            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${lead.email}`}
                className="flex items-center gap-2 rounded-lg border border-outline-variant/40 px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
              >
                <Icon name="mail" className="text-base" />
                {lead.email}
              </a>
              {lead.phone ? (
                <>
                  <a
                    href={`tel:${lead.phone}`}
                    className="flex items-center gap-2 rounded-lg border border-outline-variant/40 px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
                  >
                    <Icon name="call" className="text-base" />
                    {lead.phone}
                  </a>
                  <a
                    href={whatsappHref(lead.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-outline-variant/40 px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
                  >
                    <Icon name="chat" className="text-base" />
                    WhatsApp
                  </a>
                </>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3 border-t border-outline-variant/10 pt-4">
              <button
                type="button"
                disabled={isPending}
                onClick={() => run(() => logCallAttempt(lead.id))}
                className="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2 text-xs font-bold uppercase tracking-wide text-on-surface transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Icon name="phone_in_talk" className="text-base" />
                Registar Chamada
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => run(() => logEmailSent(lead.id))}
                className="flex items-center gap-2 rounded-lg bg-surface-container px-4 py-2 text-xs font-bold uppercase tracking-wide text-on-surface transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Icon name="forward_to_inbox" className="text-base" />
                Registar Email Enviado
              </button>
            </div>
          </Card>

          <Card className="flex flex-col gap-3 p-6">
            <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">Mensagem</p>
            <p className="whitespace-pre-wrap text-sm text-on-surface">{lead.message || "Sem mensagem."}</p>
          </Card>

          <Card className="flex flex-col gap-3 p-6">
            <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
              Notas Internas
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="Notas visíveis apenas para a equipa (histórico de negociação, detalhes do projeto, etc.)"
              className="w-full resize-y rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none transition-colors focus:border-primary"
            />
            <div>
              <button
                type="button"
                disabled={isPending || !notesDirty}
                onClick={() => run(() => updateLeadNotes(lead.id, notes))}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-bold uppercase text-on-primary transition-transform hover:scale-105 disabled:pointer-events-none disabled:opacity-40"
              >
                Guardar Notas
              </button>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4 p-6">
            <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">Estado</p>
            <select
              value={lead.status}
              disabled={isPending}
              onChange={(e) => run(() => setLeadStatus(lead.id, e.target.value))}
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-sm outline-none focus:border-primary"
            >
              {Object.keys(STATUS_LABEL).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>

            <p className="mt-2 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
              Responsável
            </p>
            <select
              value={lead.assignedTo?.id ?? ""}
              disabled={isPending}
              onChange={(e) => run(() => assignLead(lead.id, e.target.value))}
              className="w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-sm outline-none focus:border-primary"
            >
              <option value="">Sem responsável</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </Card>

          <Card className="flex flex-col gap-4 p-6">
            <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
              Histórico
            </p>
            <ol className="flex flex-col gap-4">
              <li className="flex gap-3 text-xs">
                <Icon name="mark_email_unread" className="mt-0.5 shrink-0 text-base text-primary" />
                <div>
                  <p className="text-on-surface">Lead recebida do site</p>
                  <p className="text-on-surface-variant">
                    {new Date(lead.createdAt).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}
                  </p>
                </div>
              </li>
              {activities.map((a) => (
                <li key={a.id} className="flex gap-3 text-xs">
                  <Icon name={ACTIVITY_ICON[a.type]} className="mt-0.5 shrink-0 text-base text-on-surface-variant" />
                  <div>
                    <p className="text-on-surface">{a.note}</p>
                    <p className="text-on-surface-variant">
                      {new Date(a.createdAt).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}
                      {a.userName ? ` · ${a.userName}` : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}
