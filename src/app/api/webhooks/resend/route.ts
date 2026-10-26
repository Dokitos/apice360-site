import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getResend } from "@/lib/email/resend";
import { ingestReceivedEmail, type ReceivedEventData } from "@/lib/email/inbound";
import type { EmailStatus } from "@/generated/prisma/client";
import { auditScope } from "@/lib/audit/scope";
import { randomUUID } from "node:crypto";

/**
 * Entrada dos acontecimentos do Resend.
 *
 * Dois trabalhos: receber as mensagens que chegam às contas do painel, e
 * acompanhar o que acontece às que o painel enviou (entregue, aberta,
 * devolvida). O Resend assina cada pedido; sem assinatura válida nada entra,
 * senão qualquer pessoa podia pôr emails na caixa de entrada da empresa.
 *
 * Responde sempre 200 depois de a assinatura passar, mesmo quando o conteúdo
 * não interessa: um erro aqui faz o Resend tentar de novo durante horas.
 */

type EventoResend = { type?: string; created_at?: string; data?: Record<string, unknown> };

const ESTADO_POR_EVENTO: Record<string, EmailStatus> = {
  "email.sent": "SENT",
  "email.delivered": "DELIVERED",
  "email.opened": "OPENED",
  "email.clicked": "CLICKED",
  "email.bounced": "BOUNCED",
  "email.complained": "COMPLAINED",
  "email.failed": "FAILED",
};

// Um "entregue" que chegue depois de um "aberto" não pode fazer a mensagem
// recuar: os webhooks não chegam por ordem garantida.
const ORDEM: EmailStatus[] = [
  "QUEUED",
  "SENT",
  "DELIVERED",
  "OPENED",
  "CLICKED",
  "COMPLAINED",
  "BOUNCED",
  "FAILED",
  "RECEIVED",
];

export async function POST(request: NextRequest) {
  return auditScope.run({ source: "WEBHOOK", correlationId: randomUUID() }, () => handlePost(request));
}

async function handlePost(request: NextRequest) {
  const segredo = process.env.RESEND_WEBHOOK_SECRET;
  const resend = getResend();

  if (!segredo || !resend) {
    console.error("[resend-webhook] faltam RESEND_WEBHOOK_SECRET ou RESEND_API_KEY.");
    return NextResponse.json({ error: "Webhook não configurado." }, { status: 503 });
  }

  // A assinatura é calculada sobre o corpo tal como veio. Ler como JSON e
  // voltar a convertê-lo em texto muda espaços e ordem, e a conta deixa de bater.
  const corpo = await request.text();

  let evento: EventoResend;
  try {
    evento = resend.webhooks.verify({
      payload: corpo,
      headers: {
        id: request.headers.get("svix-id") ?? "",
        timestamp: request.headers.get("svix-timestamp") ?? "",
        signature: request.headers.get("svix-signature") ?? "",
      },
      webhookSecret: segredo,
    }) as unknown as EventoResend;
  } catch (causa) {
    console.error("[resend-webhook] assinatura inválida:", causa);
    return NextResponse.json({ error: "Assinatura inválida." }, { status: 400 });
  }

  try {
    await handleEvent(evento);
  } catch (causa) {
    // Já está verificado e aceite; registar e seguir evita uma tempestade de
    // repetições por causa de uma mensagem que nunca vai entrar.
    console.error("[resend-webhook] falha a tratar o evento:", evento.type, causa);
  }

  return NextResponse.json({ received: true });
}

async function handleEvent(evento: EventoResend) {
  const tipo = evento.type ?? "";
  const dados = evento.data ?? {};

  if (tipo === "email.received" || tipo === "inbox.email.received") {
    await ingestReceivedEmail(dados as unknown as ReceivedEventData);
    return;
  }

  const estado = ESTADO_POR_EVENTO[tipo];
  if (!estado) return;

  const resendId = typeof dados.email_id === "string" ? dados.email_id : null;
  if (!resendId) return;

  const mensagem = await prisma.emailMessage.findUnique({
    where: { resendId },
    select: { id: true, status: true },
  });
  // Um evento de uma mensagem que não saiu daqui — por exemplo enviada pela
  // consola do Resend — não tem nada para actualizar.
  if (!mensagem) return;

  const avanca = ORDEM.indexOf(estado) > ORDEM.indexOf(mensagem.status);

  await prisma.$transaction([
    prisma.emailEvent.create({
      data: {
        messageId: mensagem.id,
        type: tipo,
        detail: detalheDoEvento(tipo, dados),
        occurredAt: evento.created_at ? new Date(evento.created_at) : new Date(),
      },
    }),
    ...(avanca
      ? [
          prisma.emailMessage.update({
            where: { id: mensagem.id },
            data: {
              status: estado,
              errorMessage:
                estado === "BOUNCED" || estado === "FAILED" ? detalheDoEvento(tipo, dados) : undefined,
            },
          }),
        ]
      : []),
  ]);
}

/** A razão de uma devolução ou de uma falha, quando o Resend a envia. */
function detalheDoEvento(tipo: string, dados: Record<string, unknown>): string | null {
  const bounce = dados.bounce as { message?: string; type?: string; subType?: string } | undefined;
  if (bounce?.message) return bounce.message;

  const failed = dados.failed as { reason?: string } | undefined;
  if (failed?.reason) return failed.reason;

  const click = dados.click as { link?: string } | undefined;
  if (tipo === "email.clicked" && click?.link) return click.link;

  return null;
}
