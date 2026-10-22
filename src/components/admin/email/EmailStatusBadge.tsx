import { cn } from "@/lib/cn";
import type { EmailStatus } from "@/generated/prisma/client";

const ESTADOS: Record<EmailStatus, { label: string; tom: string }> = {
  QUEUED: { label: "Na fila", tom: "bg-surface-container text-on-surface-variant" },
  SENT: { label: "Enviada", tom: "bg-surface-container text-on-surface-variant" },
  DELIVERED: { label: "Entregue", tom: "bg-green-500/10 text-green-700" },
  OPENED: { label: "Aberta", tom: "bg-green-500/15 text-green-700" },
  CLICKED: { label: "Clicada", tom: "bg-green-500/20 text-green-800" },
  BOUNCED: { label: "Devolvida", tom: "bg-red-500/10 text-red-700" },
  COMPLAINED: { label: "Marcada como spam", tom: "bg-red-500/10 text-red-700" },
  FAILED: { label: "Falhou", tom: "bg-red-500/15 text-red-700" },
  RECEIVED: { label: "Recebida", tom: "bg-surface-container text-on-surface-variant" },
};

export function EmailStatusBadge({ status }: { status: EmailStatus }) {
  const estado = ESTADOS[status];
  return (
    <span
      className={cn(
        "whitespace-nowrap rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-widest",
        estado.tom,
      )}
    >
      {estado.label}
    </span>
  );
}
