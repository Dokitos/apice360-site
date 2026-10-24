import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { replySubject } from "@/lib/email/send";
import { EmailMessageCard } from "@/components/admin/email/EmailMessageCard";
import { EmailComposer } from "@/components/admin/email/EmailComposer";
import { MarkReadOnOpen } from "@/components/admin/email/MarkReadOnOpen";
import { MessageActions } from "@/components/admin/email/MessageActions";
import { AdminIcon as Icon } from "@/components/admin/AdminIcon";

export default async function EmailMessagePage({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("email", "view");
  const { id } = await params;

  const mensagem = await prisma.emailMessage.findUnique({
    where: { id },
    include: { attachments: true },
  });
  if (!mensagem) notFound();

  const [fio, contas, modelos, eventos, lead] = await Promise.all([
    prisma.emailMessage.findMany({
      where: { threadId: mensagem.threadId },
      orderBy: { createdAt: "asc" },
      include: { attachments: true },
    }),
    prisma.emailAccount.findMany({
      where: { isActive: true },
      orderBy: [{ isDefault: "desc" }, { address: "asc" }],
      select: { id: true, address: true, displayName: true, isDefault: true },
    }),
    prisma.emailTemplate.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, subject: true, bodyHtml: true },
    }),
    prisma.emailEvent.findMany({
      where: { messageId: mensagem.id },
      orderBy: { occurredAt: "asc" },
    }),
    // Quem escreveu já pode estar na lista de leads — poupa uma procura à mão.
    prisma.leadSubmission.findFirst({
      where: { email: mensagem.direction === "INBOUND" ? mensagem.fromAddress : { in: mensagem.toAddresses } },
      select: { refNumber: true, name: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const ultima = fio[fio.length - 1] ?? mensagem;
  const responderA = ultima.direction === "INBOUND" ? ultima.fromAddress : ultima.toAddresses[0];

  return (
    <div className="space-y-6">
      <MarkReadOnOpen id={mensagem.id} alreadyRead={mensagem.isRead} />

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Link
            href="/admin/email"
            className="mb-2 inline-flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary"
          >
            <Icon name="arrow_back" className="text-base" />
            Voltar
          </Link>
          <h2 className="font-heading text-headline-md">{mensagem.subject}</h2>
          {fio.length > 1 ? (
            <p className="mt-1 text-sm text-on-surface-variant">{fio.length} mensagens nesta conversa</p>
          ) : null}
        </div>
        <MessageActions
          id={mensagem.id}
          folder={mensagem.folder}
          isStarred={mensagem.isStarred}
          isRead={mensagem.isRead}
        />
      </div>

      {lead ? (
        <Link
          href={`/admin/leads/${lead.refNumber}`}
          className="flex w-fit items-center gap-2 rounded-lg border border-outline-variant/40 px-4 py-2 text-sm transition-colors hover:border-primary hover:text-primary"
        >
          <Icon name="contact_mail" className="text-base" />
          Este contacto tem uma lead: #{lead.refNumber} — {lead.name}
        </Link>
      ) : null}

      <div className="space-y-4">
        {fio.map((m) => (
          <EmailMessageCard key={m.id} message={m} />
        ))}
      </div>

      {eventos.length > 0 ? (
        <section className="rounded-lg border border-outline-variant/20 p-5">
          <h3 className="mb-3 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
            Histórico de entrega
          </h3>
          <ul className="space-y-2 text-sm">
            {eventos.map((evento) => (
              <li key={evento.id} className="flex flex-wrap items-baseline gap-x-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                  {evento.occurredAt.toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short" })}
                </span>
                <span>{rotuloDoEvento(evento.type)}</span>
                {evento.detail ? (
                  <span className="text-on-surface-variant">— {evento.detail}</span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-lg border border-outline-variant/20 p-5">
        <h3 className="mb-4 font-heading text-headline-sm">Responder</h3>
        <EmailComposer
          compact
          accounts={contas}
          templates={modelos}
          defaultTo={responderA ?? ""}
          defaultSubject={replySubject(mensagem.subject)}
          replyToMessageId={ultima.id}
        />
      </section>
    </div>
  );
}

const ROTULOS: Record<string, string> = {
  "email.sent": "Entregue ao servidor de envio",
  "email.delivered": "Entregue na caixa do destinatário",
  "email.opened": "Aberta pelo destinatário",
  "email.clicked": "Clicou numa ligação",
  "email.bounced": "Devolvida",
  "email.complained": "Marcada como spam pelo destinatário",
  "email.failed": "Falhou",
  "email.delivery_delayed": "Entrega atrasada",
};

function rotuloDoEvento(tipo: string): string {
  return ROTULOS[tipo] ?? tipo;
}
