import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/email/resend";
import { parseAddress } from "@/lib/email/addresses";
import { sanitizeEmailHtml, snippetFrom } from "@/lib/email/html";
import { normalizeSubject } from "@/lib/email/send";

/** O que o webhook `email.received` traz — só metadados, sem corpo. */
export type ReceivedEventData = {
  email_id: string;
  created_at?: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  received_for?: string[];
  message_id?: string;
  subject?: string;
  attachments?: { id: string; filename: string; content_type?: string; content_disposition?: string | null; content_id?: string | null; size?: number }[];
};

/** O que a API de recebidos devolve a mais: corpo, cabeçalhos e autenticação. */
type ReceivedEmailFull = {
  id: string;
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject?: string;
  html?: string | null;
  text?: string | null;
  headers?: Record<string, string> | null;
  message_id?: string;
  created_at?: string;
  authentication?: { spf?: string; dkim?: string; dmarc?: string } | null;
  attachments?: { id: string; filename: string; content_type?: string; content_disposition?: string | null; content_id?: string | null; size?: number }[];
};

/**
 * Guarda uma mensagem recebida.
 *
 * O webhook só traz metadados — quem enviou, para quem, assunto e a lista de
 * anexos —, por isso o corpo é pedido a seguir à API de recebidos. Se esse
 * pedido falhar, a mensagem fica na mesma na caixa de entrada com o que havia:
 * é preferível uma linha sem corpo a um email que nunca apareceu.
 */
export async function ingestReceivedEmail(data: ReceivedEventData): Promise<string | null> {
  const jaExiste = await prisma.emailMessage.findUnique({
    where: { resendId: data.email_id },
    select: { id: true },
  });
  // Os webhooks podem repetir-se: o Resend volta a tentar quando não recebe
  // um 2xx, e a segunda entrega não pode criar uma segunda cópia.
  if (jaExiste) return jaExiste.id;

  const completo = await fetchReceivedEmail(data.email_id);

  const remetente = parseAddress(completo?.from ?? data.from);
  const assunto = completo?.subject ?? data.subject ?? "(sem assunto)";
  const html = completo?.html ? sanitizeEmailHtml(completo.html) : null;
  const texto = completo?.text ?? null;
  const cabecalhos = normalizeHeaders(completo?.headers);
  const destinos = completo?.to ?? data.to ?? [];

  const threadId = await resolveThreadId({
    inReplyTo: cabecalhos["in-reply-to"] ?? null,
    references: cabecalhos["references"] ?? null,
    subject: assunto,
    participants: [remetente.address, ...destinos.map((t) => parseAddress(t).address)],
  });

  const conta = await prisma.emailAccount.findFirst({
    where: { address: { in: destinos.map((t) => parseAddress(t).address) } },
    select: { id: true },
  });

  const mensagem = await prisma.emailMessage.create({
    data: {
      direction: "INBOUND",
      folder: "INBOX",
      status: "RECEIVED",
      resendId: data.email_id,
      messageId: completo?.message_id ?? data.message_id ?? null,
      inReplyTo: cabecalhos["in-reply-to"] ?? null,
      threadId,
      accountId: conta?.id ?? null,
      fromAddress: remetente.address,
      fromName: remetente.name,
      toAddresses: destinos.map((t) => parseAddress(t).address),
      ccAddresses: (completo?.cc ?? data.cc ?? []).map((t) => parseAddress(t).address),
      bccAddresses: [],
      subject: assunto,
      bodyHtml: html,
      bodyText: texto,
      snippet: snippetFrom(html, texto),
      isRead: false,
      spfResult: completo?.authentication?.spf ?? null,
      dkimResult: completo?.authentication?.dkim ?? null,
      dmarcResult: completo?.authentication?.dmarc ?? null,
      receivedAt: data.created_at ? new Date(data.created_at) : new Date(),
      attachments: {
        create: (completo?.attachments ?? data.attachments ?? []).map((a) => ({
          filename: a.filename,
          contentType: a.content_type ?? null,
          size: a.size ?? null,
          resendAttachmentId: a.id,
          isInline: a.content_disposition === "inline",
        })),
      },
    },
  });

  return mensagem.id;
}

async function fetchReceivedEmail(id: string): Promise<ReceivedEmailFull | null> {
  const resend = getResend();
  if (!resend) return null;
  try {
    const { data, error } = await resend.emails.receiving.get(id);
    if (error || !data) {
      console.error("[email] não foi possível obter o corpo da mensagem recebida:", error);
      return null;
    }
    return data as unknown as ReceivedEmailFull;
  } catch (causa) {
    console.error("[email] falha ao pedir a mensagem recebida ao Resend:", causa);
    return null;
  }
}

function normalizeHeaders(headers: Record<string, string> | null | undefined): Record<string, string> {
  const saida: Record<string, string> = {};
  for (const [chave, valor] of Object.entries(headers ?? {})) {
    saida[chave.toLowerCase()] = valor;
  }
  return saida;
}

/**
 * A que conversa pertence uma mensagem.
 *
 * Primeiro pelos cabeçalhos, que é o que os clientes de email usam entre si.
 * Nem todos os remetentes os enviam bem, por isso há uma segunda tentativa
 * pelo assunto sem "Re:" e por haver alguém em comum — limitada a noventa
 * dias para dois "Orçamento" com um ano de intervalo não caírem no mesmo fio.
 */
export async function resolveThreadId(opts: {
  inReplyTo: string | null;
  references: string | null;
  subject: string;
  participants: string[];
}): Promise<string> {
  const ids = [opts.inReplyTo, ...(opts.references?.split(/\s+/) ?? [])]
    .map((v) => v?.trim())
    .filter((v): v is string => Boolean(v));

  if (ids.length > 0) {
    const anterior = await prisma.emailMessage.findFirst({
      where: { messageId: { in: ids } },
      select: { threadId: true },
    });
    if (anterior) return anterior.threadId;
  }

  const assunto = normalizeSubject(opts.subject);
  if (assunto) {
    const limite = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const candidatos = await prisma.emailMessage.findMany({
      where: { createdAt: { gte: limite } },
      select: { threadId: true, subject: true, fromAddress: true, toAddresses: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
    const encontrado = candidatos.find(
      (m) =>
        normalizeSubject(m.subject) === assunto &&
        [m.fromAddress, ...m.toAddresses].some((a) => opts.participants.includes(a)),
    );
    if (encontrado) return encontrado.threadId;
  }

  return crypto.randomUUID();
}

/** Link temporário para descarregar um anexo recebido. */
export async function receivedAttachmentUrl(emailId: string, attachmentId: string): Promise<string | null> {
  const resend = getResend();
  if (!resend) return null;
  try {
    const { data, error } = await resend.emails.receiving.attachments.get({
      emailId,
      id: attachmentId,
    });
    if (error || !data) return null;
    // O endereço é assinado e expira — por isso é pedido no momento do
    // clique, e não guardado com o resto da mensagem.
    return data.download_url ?? null;
  } catch (causa) {
    console.error("[email] falha ao obter o anexo:", causa);
    return null;
  }
}
