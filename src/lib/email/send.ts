import { prisma } from "@/lib/prisma";
import { getResend, resendErrorMessage } from "@/lib/email/resend";
import { formatAddress } from "@/lib/email/addresses";
import { htmlToText, sanitizeEmailHtml, snippetFrom } from "@/lib/email/html";

export type OutgoingAttachment = { filename: string; url: string; contentType?: string | null };

export type SendEmailInput = {
  accountId: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  bodyHtml: string;
  attachments?: OutgoingAttachment[];
  /** Mensagem a que esta responde, para ficar no mesmo fio. */
  replyToMessageId?: string | null;
  sentById?: string | null;
};

export type SendEmailResult = { ok: true; id: string } | { ok: false; message: string };

/**
 * Envia uma mensagem e guarda-a em Enviados.
 *
 * A mensagem é gravada antes de sair: se o Resend recusar, fica registada
 * como falhada e com a razão à vista, em vez de desaparecer com um aviso que
 * ninguém volta a ver. O estado seguinte (entregue, aberta, devolvida) chega
 * pelos webhooks, minutos depois.
 */
export async function sendEmailMessage(input: SendEmailInput): Promise<SendEmailResult> {
  const resend = getResend();
  if (!resend) {
    return { ok: false, message: "O envio de email ainda não está configurado (falta a RESEND_API_KEY)." };
  }

  const account = await prisma.emailAccount.findUnique({ where: { id: input.accountId } });
  if (!account || !account.isActive) {
    return { ok: false, message: "A conta de envio escolhida não existe ou está inativa." };
  }

  const original = input.replyToMessageId
    ? await prisma.emailMessage.findUnique({
        where: { id: input.replyToMessageId },
        select: { id: true, threadId: true, messageId: true },
      })
    : null;

  const corpo = sanitizeEmailHtml(
    account.signatureHtml
      ? `${input.bodyHtml}<br /><br />${sanitizeEmailHtml(account.signatureHtml)}`
      : input.bodyHtml,
  );
  const texto = htmlToText(corpo);

  const mensagem = await prisma.emailMessage.create({
    data: {
      direction: "OUTBOUND",
      folder: "SENT",
      status: "QUEUED",
      threadId: original?.threadId ?? crypto.randomUUID(),
      inReplyTo: original?.messageId ?? null,
      accountId: account.id,
      fromAddress: account.address,
      fromName: account.displayName,
      toAddresses: input.to,
      ccAddresses: input.cc ?? [],
      bccAddresses: input.bcc ?? [],
      subject: input.subject,
      bodyHtml: corpo,
      bodyText: texto,
      snippet: snippetFrom(corpo, texto),
      isRead: true,
      sentById: input.sentById ?? null,
      attachments: input.attachments?.length
        ? {
            create: input.attachments.map((a) => ({
              filename: a.filename,
              contentType: a.contentType ?? null,
              url: a.url,
            })),
          }
        : undefined,
    },
  });

  // Sem estes cabeçalhos a resposta chega ao destinatário como uma conversa
  // nova, fora do fio original.
  const headers: Record<string, string> = {};
  if (original?.messageId) {
    headers["In-Reply-To"] = original.messageId;
    headers["References"] = original.messageId;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: formatAddress(account.displayName, account.address),
      to: input.to,
      cc: input.cc?.length ? input.cc : undefined,
      bcc: input.bcc?.length ? input.bcc : undefined,
      subject: input.subject,
      html: corpo,
      text: texto,
      headers: Object.keys(headers).length > 0 ? headers : undefined,
      // `path` é um endereço público de onde o Resend vai buscar o ficheiro —
      // é exactamente o que o armazenamento do painel devolve ao carregar um
      // anexo, por isso o ficheiro não passa outra vez por aqui.
      attachments: input.attachments?.length
        ? input.attachments.map((a) => ({ filename: a.filename, path: a.url }))
        : undefined,
    });

    if (error || !data?.id) {
      const message = resendErrorMessage(error);
      await prisma.emailMessage.update({
        where: { id: mensagem.id },
        data: { status: "FAILED", errorMessage: message },
      });
      return { ok: false, message };
    }

    await prisma.emailMessage.update({
      where: { id: mensagem.id },
      data: { status: "SENT", resendId: data.id, sentAt: new Date() },
    });

    return { ok: true, id: mensagem.id };
  } catch (causa) {
    const message = causa instanceof Error ? causa.message : "Falha ao contactar o serviço de email.";
    await prisma.emailMessage.update({
      where: { id: mensagem.id },
      data: { status: "FAILED", errorMessage: message },
    });
    return { ok: false, message };
  }
}

/** "Re: assunto", sem empilhar prefixos quando já lá está um. */
export function replySubject(subject: string): string {
  return /^\s*re\s*:/i.test(subject) ? subject : `Re: ${subject}`;
}

/** Assunto sem prefixos, para juntar ao mesmo fio mensagens com Re:/Fwd:. */
export function normalizeSubject(subject: string): string {
  return subject
    .replace(/^\s*((re|fw|fwd|enc|res)\s*:\s*)+/gi, "")
    .trim()
    .toLowerCase();
}
