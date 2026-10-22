import { Resend } from "resend";

/**
 * Cliente do Resend, criado uma vez.
 *
 * Devolve null quando não há chave configurada, em vez de rebentar na
 * importação: o painel tem de abrir na mesma e explicar o que falta, senão
 * quem instala o site vê um erro em vez de instruções.
 */
let cliente: Resend | null | undefined;

export function getResend(): Resend | null {
  if (cliente === undefined) {
    const chave = process.env.RESEND_API_KEY;
    cliente = chave ? new Resend(chave) : null;
  }
  return cliente;
}

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function isWebhookConfigured(): boolean {
  return Boolean(process.env.RESEND_WEBHOOK_SECRET);
}

/**
 * O Resend devolve `{ data, error }` em vez de lançar. Isto transforma o erro
 * numa mensagem legível, que é o que o painel mostra a quem está a escrever.
 */
export function resendErrorMessage(error: unknown): string {
  if (!error) return "Erro desconhecido no serviço de email.";
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null) {
    const e = error as { message?: string; name?: string };
    if (e.message) return e.message;
    if (e.name) return e.name;
  }
  return "Erro desconhecido no serviço de email.";
}
