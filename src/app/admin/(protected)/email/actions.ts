"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import {
  emailAccountSchema,
  emailTemplateSchema,
  composeEmailSchema,
  attachmentListSchema,
} from "@/lib/validations/email";
import { sanitizeEmailHtml } from "@/lib/email/html";
import { invalidAddresses, parseAddressList } from "@/lib/email/addresses";
import { sendEmailMessage, type OutgoingAttachment } from "@/lib/email/send";
import { receivedAttachmentUrl } from "@/lib/email/inbound";
import { getResend } from "@/lib/email/resend";

function revalidateEmail() {
  revalidatePath("/admin/email");
}

// ---------------------------------------------------------------------------
// Escrever e responder
// ---------------------------------------------------------------------------

export type ComposeState = { ok: boolean; message: string; id?: string } | undefined;

export async function sendEmail(_prevState: ComposeState, formData: FormData): Promise<ComposeState> {
  const utilizador = await requirePermission("email", "create");

  const parsed = composeEmailSchema.safeParse({
    accountId: formData.get("accountId"),
    to: formData.get("to"),
    cc: formData.get("cc") || undefined,
    bcc: formData.get("bcc") || undefined,
    subject: formData.get("subject"),
    bodyHtml: formData.get("bodyHtml"),
    replyToMessageId: formData.get("replyToMessageId") || undefined,
    attachments: formData.get("attachments") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const to = parseAddressList(parsed.data.to);
  const cc = parseAddressList(parsed.data.cc);
  const bcc = parseAddressList(parsed.data.bcc);

  const invalidos = invalidAddresses([...to, ...cc, ...bcc]);
  if (invalidos.length > 0) {
    return { ok: false, message: `Endereço inválido: ${invalidos.join(", ")}` };
  }
  if (to.length === 0) return { ok: false, message: "Indica pelo menos um destinatário." };
  if (to.length + cc.length + bcc.length > 50) {
    return { ok: false, message: "São demasiados destinatários — o limite por mensagem é 50." };
  }

  let anexos: OutgoingAttachment[] = [];
  if (parsed.data.attachments) {
    try {
      anexos = attachmentListSchema.parse(JSON.parse(parsed.data.attachments));
    } catch {
      return { ok: false, message: "Não foi possível ler a lista de anexos." };
    }
  }

  const resultado = await sendEmailMessage({
    accountId: parsed.data.accountId,
    to,
    cc,
    bcc,
    subject: parsed.data.subject,
    bodyHtml: sanitizeEmailHtml(parsed.data.bodyHtml),
    attachments: anexos,
    replyToMessageId: parsed.data.replyToMessageId || null,
    sentById: utilizador.id,
  });

  if (!resultado.ok) return { ok: false, message: resultado.message };

  revalidateEmail();
  return { ok: true, message: "Mensagem enviada.", id: resultado.id };
}

// ---------------------------------------------------------------------------
// Arrumar a caixa
// ---------------------------------------------------------------------------

export async function markRead(id: string, read: boolean) {
  await requirePermission("email", "edit");
  await prisma.emailMessage.update({ where: { id }, data: { isRead: read } });
  revalidateEmail();
}

export async function toggleStar(id: string) {
  await requirePermission("email", "edit");
  const atual = await prisma.emailMessage.findUnique({ where: { id }, select: { isStarred: true } });
  if (!atual) return;
  await prisma.emailMessage.update({ where: { id }, data: { isStarred: !atual.isStarred } });
  revalidateEmail();
}

export async function moveToFolder(id: string, folder: "INBOX" | "ARCHIVE" | "TRASH" | "SPAM") {
  await requirePermission("email", "edit");
  await prisma.emailMessage.update({ where: { id }, data: { folder } });
  revalidateEmail();
}

export async function deleteMessage(id: string) {
  await requirePermission("email", "delete");
  await prisma.emailMessage.delete({ where: { id } });
  revalidateEmail();
  redirect("/admin/email");
}

/**
 * Endereço de descarga de um anexo recebido. É assinado e expira, por isso é
 * pedido no momento do clique em vez de ficar guardado com a mensagem.
 */
export async function getAttachmentUrl(attachmentId: string): Promise<string | null> {
  await requirePermission("email", "view");
  const anexo = await prisma.emailAttachment.findUnique({
    where: { id: attachmentId },
    select: { url: true, resendAttachmentId: true, message: { select: { resendId: true } } },
  });
  if (!anexo) return null;
  if (anexo.url) return anexo.url;
  if (!anexo.resendAttachmentId || !anexo.message.resendId) return null;
  return receivedAttachmentUrl(anexo.message.resendId, anexo.resendAttachmentId);
}

// ---------------------------------------------------------------------------
// Contas
// ---------------------------------------------------------------------------

function readAccountForm(formData: FormData) {
  return {
    address: formData.get("address"),
    displayName: formData.get("displayName"),
    signatureHtml: formData.get("signatureHtml") || undefined,
    isDefault: formData.get("isDefault") === "on",
    isActive: formData.get("isActive") === "on",
  };
}

export async function createEmailAccount(_prevState: string | undefined, formData: FormData) {
  await requirePermission("email", "create");
  const parsed = emailAccountSchema.safeParse(readAccountForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const existente = await prisma.emailAccount.findUnique({
    where: { address: parsed.data.address },
    select: { id: true },
  });
  if (existente) return "Já existe uma conta com esse endereço.";

  const { signatureHtml, isDefault, ...data } = parsed.data;
  if (isDefault) await prisma.emailAccount.updateMany({ data: { isDefault: false } });

  await prisma.emailAccount.create({
    data: {
      ...data,
      isDefault,
      signatureHtml: signatureHtml ? sanitizeEmailHtml(signatureHtml) : null,
    },
  });

  revalidateEmail();
  redirect("/admin/email/contas?saved=1");
}

export async function updateEmailAccount(id: string, _prevState: string | undefined, formData: FormData) {
  await requirePermission("email", "edit");
  const parsed = emailAccountSchema.safeParse(readAccountForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const colisao = await prisma.emailAccount.findUnique({
    where: { address: parsed.data.address },
    select: { id: true },
  });
  if (colisao && colisao.id !== id) return "Já existe outra conta com esse endereço.";

  const { signatureHtml, isDefault, ...data } = parsed.data;
  // Só pode haver uma conta por omissão: a que ficar marcada desmarca as outras.
  if (isDefault) await prisma.emailAccount.updateMany({ where: { id: { not: id } }, data: { isDefault: false } });

  await prisma.emailAccount.update({
    where: { id },
    data: {
      ...data,
      isDefault,
      signatureHtml: signatureHtml ? sanitizeEmailHtml(signatureHtml) : null,
    },
  });

  revalidateEmail();
  redirect("/admin/email/contas?saved=1");
}

export async function deleteEmailAccount(id: string) {
  await requirePermission("email", "delete");
  await prisma.emailAccount.delete({ where: { id } });
  revalidateEmail();
}

/**
 * Vai ao Resend perguntar em que estado está o domínio de cada conta. Sem o
 * domínio verificado o envio é recusado, e esta é a única forma de o painel
 * poder dizer porquê antes de alguém tentar enviar.
 */
export async function refreshDomainStatus() {
  await requirePermission("email", "edit");
  const resend = getResend();
  if (!resend) return;

  const { data, error } = await resend.domains.list();
  if (error || !data) return;

  const estados = new Map<string, string>();
  for (const dominio of data.data ?? []) {
    estados.set(dominio.name.toLowerCase(), dominio.status);
  }

  const contas = await prisma.emailAccount.findMany({ select: { id: true, address: true } });
  await Promise.all(
    contas.map((conta) =>
      prisma.emailAccount.update({
        where: { id: conta.id },
        data: { domainStatus: estados.get(conta.address.split("@")[1]?.toLowerCase() ?? "") ?? "not_found" },
      }),
    ),
  );

  revalidatePath("/admin/email/contas");
}

// ---------------------------------------------------------------------------
// Modelos
// ---------------------------------------------------------------------------

function readTemplateForm(formData: FormData) {
  return {
    key: formData.get("key"),
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    locale: formData.get("locale") || "PT",
    subject: formData.get("subject"),
    bodyHtml: formData.get("bodyHtml"),
    isActive: formData.get("isActive") === "on",
  };
}

export async function createEmailTemplate(_prevState: string | undefined, formData: FormData) {
  await requirePermission("email", "create");
  const parsed = emailTemplateSchema.safeParse(readTemplateForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const existente = await prisma.emailTemplate.findUnique({
    where: { key: parsed.data.key },
    select: { id: true },
  });
  if (existente) return "Já existe um modelo com essa chave.";

  await prisma.emailTemplate.create({
    data: { ...parsed.data, bodyHtml: sanitizeEmailHtml(parsed.data.bodyHtml) },
  });

  revalidateEmail();
  redirect("/admin/email/modelos?saved=1");
}

export async function updateEmailTemplate(id: string, _prevState: string | undefined, formData: FormData) {
  await requirePermission("email", "edit");
  const parsed = emailTemplateSchema.safeParse(readTemplateForm(formData));
  if (!parsed.success) return parsed.error.issues[0]?.message ?? "Dados inválidos.";

  const colisao = await prisma.emailTemplate.findUnique({
    where: { key: parsed.data.key },
    select: { id: true },
  });
  if (colisao && colisao.id !== id) return "Já existe outro modelo com essa chave.";

  await prisma.emailTemplate.update({
    where: { id },
    data: { ...parsed.data, bodyHtml: sanitizeEmailHtml(parsed.data.bodyHtml) },
  });

  revalidateEmail();
  redirect("/admin/email/modelos?saved=1");
}

export async function deleteEmailTemplate(id: string) {
  await requirePermission("email", "delete");
  await prisma.emailTemplate.delete({ where: { id } });
  revalidateEmail();
}
