import { z } from "zod";

const optionalText = z.string().trim().optional().or(z.literal(""));

export const emailAccountSchema = z.object({
  address: z
    .string()
    .trim()
    .min(1, "Indica o endereço de email.")
    .email("Esse endereço não parece válido.")
    .transform((v) => v.toLowerCase()),
  displayName: z.string().trim().min(1, "Indica o nome que aparece a quem recebe."),
  signatureHtml: optionalText,
  isDefault: z.boolean(),
  isActive: z.boolean(),
});

export const emailTemplateSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Indica a chave do modelo.")
    .regex(/^[a-z0-9_]+$/, "Usa apenas minúsculas, números e underscore (ex: proposta_enviada)."),
  name: z.string().trim().min(1, "Dá um nome ao modelo."),
  description: optionalText,
  locale: z.enum(["PT", "EN", "ES", "FR"]),
  subject: z.string().trim().min(1, "Indica o assunto."),
  bodyHtml: z.string().trim().min(1, "Escreve o corpo da mensagem."),
  isActive: z.boolean(),
});

/**
 * Uma mensagem a sair. Os destinatários chegam como texto escrito à mão e são
 * separados depois (ver parseAddressList), por isso aqui só se exige que o
 * campo não venha vazio.
 */
export const composeEmailSchema = z.object({
  accountId: z.string().trim().min(1, "Escolhe a conta de onde vai sair a mensagem."),
  to: z.string().trim().min(1, "Indica pelo menos um destinatário."),
  cc: optionalText,
  bcc: optionalText,
  subject: z.string().trim().min(1, "Indica o assunto.").max(300, "O assunto é demasiado longo."),
  bodyHtml: z.string().trim().min(1, "Escreve a mensagem."),
  replyToMessageId: optionalText,
  attachments: optionalText,
});

/** Anexos escolhidos no formulário, enviados como JSON num campo escondido. */
export const attachmentListSchema = z.array(
  z.object({
    filename: z.string().trim().min(1),
    url: z.string().trim().url(),
    contentType: z.string().trim().optional().nullable(),
  }),
);
