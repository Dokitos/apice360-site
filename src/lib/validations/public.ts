import { z } from "zod";
import { checkEmail, checkPhone, type EmailIssue, type PhoneIssue } from "@/lib/validations/contactable";

/** Mensagens PT por motivo de recusa — o mesmo texto que o cliente vê no formulário. */
export const EMAIL_ISSUE_MESSAGES: Record<EmailIssue, string> = {
  empty: "Indica um email válido.",
  syntax: "Esse email não parece válido. Confirma se está bem escrito.",
  domain: "O domínio desse email não parece existir. Confirma se está bem escrito.",
  disposable: "Endereços de email temporários não são aceites. Usa o teu email habitual.",
  placeholder: "Esse email é um exemplo. Indica o teu email real para te podermos responder.",
  no_mail_server: "Não conseguimos confirmar esse domínio de email. Confirma se está bem escrito.",
};

export const PHONE_ISSUE_MESSAGES: Record<PhoneIssue, string> = {
  empty: "Indica um número de telefone.",
  syntax: "Esse número não parece válido. Usa apenas dígitos (ex: 924 107 846).",
  length: "Esse número não tem os dígitos suficientes. Confirma se está completo.",
  fake: "Esse número não parece real. Indica o teu número de contacto.",
  not_portuguese: "Número português inválido. Usa 9 dígitos (ex: 924 107 846) ou inclui o indicativo do país.",
};

/** Campo de email com verificação de forma (sintaxe + domínio + descartáveis). */
export const contactableEmail = z
  .string()
  .trim()
  .min(1, EMAIL_ISSUE_MESSAGES.empty)
  .superRefine((value, ctx) => {
    const result = checkEmail(value);
    if (!result.ok) {
      ctx.addIssue({ code: "custom", message: EMAIL_ISSUE_MESSAGES[result.reason as EmailIssue] });
    }
  });

/** Campo de telefone com verificação de forma. */
export const contactablePhone = z
  .string()
  .trim()
  .min(1, PHONE_ISSUE_MESSAGES.empty)
  .superRefine((value, ctx) => {
    const result = checkPhone(value);
    if (!result.ok) {
      ctx.addIssue({ code: "custom", message: PHONE_ISSUE_MESSAGES[result.reason as PhoneIssue] });
    }
  });

export const leadSchema = z.object({
  name: z.string().trim().min(1, "Indica o teu nome."),
  email: contactableEmail,
  // Opcional no formulário de contacto genérico, mas se for preenchido tem de ser um número real.
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .superRefine((value, ctx) => {
      if (!value) return;
      const result = checkPhone(value);
      if (!result.ok) {
        ctx.addIssue({ code: "custom", message: PHONE_ISSUE_MESSAGES[result.reason as PhoneIssue] });
      }
    }),
  message: z.string().trim().optional().or(z.literal("")),
  // honeypot: real users never fill this hidden field, bots usually do.
  company: z.string().max(0, "Falha na validação.").optional().or(z.literal("")),
});

/** Simulador da landing page: nome, email e telefone são todos obrigatórios e verificados. */
export const lpSimulatorLeadSchema = z.object({
  name: z.string().trim().min(2, "Indica o teu nome completo.").max(200),
  email: contactableEmail,
  phone: contactablePhone,
  buildLocation: z.string().trim().max(200).optional().or(z.literal("")),
  hasLand: z.string().trim().max(40).optional().or(z.literal("")),
  hasProject: z.string().trim().max(40).optional().or(z.literal("")),
  floors: z.string().trim().max(60).optional().or(z.literal("")),
  squareMeters: z.coerce
    .number({ error: "Indica os metros quadrados pretendidos." })
    .int("Indica os metros quadrados em número inteiro.")
    .min(20, "A área mínima considerada é de 20 m².")
    .max(2000, "Para áreas acima de 2000 m² fala diretamente com a nossa equipa."),
  company: z.string().max(0, "Falha na validação.").optional().or(z.literal("")),
});

export const commentSchema = z.object({
  authorName: z.string().trim().min(1, "Indica o teu nome."),
  authorEmail: contactableEmail,
  body: z.string().trim().min(3, "Escreve um comentário um pouco mais longo."),
  company: z.string().max(0, "Falha na validação.").optional().or(z.literal("")),
});
