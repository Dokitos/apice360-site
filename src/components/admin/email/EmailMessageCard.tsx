import { displayNameFor } from "@/lib/email/addresses";
import { sanitizeEmailHtml } from "@/lib/email/html";
import { EmailStatusBadge } from "@/components/admin/email/EmailStatusBadge";
import { AttachmentLink } from "@/components/admin/email/AttachmentLink";
import { AdminIcon as Icon } from "@/components/admin/AdminIcon";
import { cn } from "@/lib/cn";
import type { EmailStatus, EmailDirection } from "@/generated/prisma/client";

export type MessageCardData = {
  id: string;
  direction: EmailDirection;
  status: EmailStatus;
  fromAddress: string;
  fromName: string | null;
  toAddresses: string[];
  ccAddresses: string[];
  subject: string;
  bodyHtml: string | null;
  bodyText: string | null;
  errorMessage: string | null;
  spfResult: string | null;
  dkimResult: string | null;
  dmarcResult: string | null;
  sentAt: Date | null;
  receivedAt: Date | null;
  createdAt: Date;
  attachments: { id: string; filename: string; contentType: string | null; size: number | null }[];
};

export function EmailMessageCard({ message }: { message: MessageCardData }) {
  const saida = message.direction === "OUTBOUND";
  const quando = message.receivedAt ?? message.sentAt ?? message.createdAt;
  const autenticacaoFalhou =
    !saida &&
    [message.spfResult, message.dkimResult, message.dmarcResult].some((r) => r === "fail");

  return (
    <article
      className={cn(
        "rounded-lg border bg-surface-container-lowest",
        saida ? "border-primary/30" : "border-outline-variant/20",
      )}
    >
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-outline-variant/10 p-5">
        <div className="min-w-0">
          <p className="font-bold">
            {displayNameFor(message.fromName, message.fromAddress)}{" "}
            <span className="font-normal text-on-surface-variant">&lt;{message.fromAddress}&gt;</span>
          </p>
          <p className="text-sm text-on-surface-variant">Para: {message.toAddresses.join(", ")}</p>
          {message.ccAddresses.length > 0 ? (
            <p className="text-sm text-on-surface-variant">Cc: {message.ccAddresses.join(", ")}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <time className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
            {quando.toLocaleString("pt-PT", { dateStyle: "medium", timeStyle: "short" })}
          </time>
          {saida ? <EmailStatusBadge status={message.status} /> : null}
        </div>
      </header>

      {message.errorMessage ? (
        <p className="border-b border-outline-variant/10 bg-red-500/5 px-5 py-3 text-sm text-red-700">
          {message.errorMessage}
        </p>
      ) : null}

      {autenticacaoFalhou ? (
        <p className="flex items-start gap-2 border-b border-outline-variant/10 bg-red-500/5 px-5 py-3 text-sm text-red-700">
          <Icon name="gpp_bad" className="shrink-0 text-base" />
          O remetente não passou nas verificações de autenticação (SPF {message.spfResult ?? "?"}, DKIM{" "}
          {message.dkimResult ?? "?"}, DMARC {message.dmarcResult ?? "?"}). Trata esta mensagem com desconfiança.
        </p>
      ) : null}

      <div className="p-5">
        {message.bodyHtml ? (
          // Limpo outra vez aqui, e não só à entrada: o corpo vem de
          // desconhecidos, e a garantia tem de estar no sítio que o desenha —
          // não a uma gravação de distância, onde um caminho novo para a
          // tabela a perderia sem ninguém dar por isso.
          <div
            className="prose max-w-none text-sm leading-relaxed prose-headings:font-heading prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: sanitizeEmailHtml(message.bodyHtml) }}
          />
        ) : message.bodyText ? (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{message.bodyText}</pre>
        ) : (
          <p className="text-sm italic text-on-surface-variant">
            Esta mensagem chegou sem corpo legível.
          </p>
        )}
      </div>

      {message.attachments.length > 0 ? (
        <footer className="flex flex-wrap gap-2 border-t border-outline-variant/10 p-5">
          {message.attachments.map((anexo) => (
            <AttachmentLink
              key={anexo.id}
              id={anexo.id}
              filename={anexo.filename}
              size={anexo.size}
            />
          ))}
        </footer>
      ) : null}
    </article>
  );
}
