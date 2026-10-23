"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { checkEmail } from "@/lib/validations/contactable";
import { domainAcceptsMail } from "@/lib/validations/contactable.server";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { getLocale } from "@/lib/locale";

export type NewsletterState = { ok: boolean; message: string } | undefined;

/**
 * Inscrição na newsletter, a partir do rodapé.
 *
 * Reinscrever quem já cancelou volta a ligar a inscrição, em vez de rebentar
 * contra o índice único do email: do lado de quem carrega no botão, uma
 * segunda inscrição é um pedido para voltar a receber, não um erro.
 */
export async function subscribeToNewsletter(
  _prevState: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  // Honeypot, como nos outros formulários públicos.
  if (String(formData.get("company") ?? "")) return { ok: true, message: "" };

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const verificado = checkEmail(email);
  if (!verificado.ok) {
    return { ok: false, message: "Esse email não parece válido." };
  }

  const ip = clientIpFromHeaders(await headers());
  const { ok: dentroDoLimite } = rateLimit(`newsletter:${ip}`, 5, 60_000);
  if (!dentroDoLimite) {
    return { ok: false, message: "Demasiados pedidos. Tenta novamente dentro de instantes." };
  }

  if (!(await domainAcceptsMail(email))) {
    return { ok: false, message: "Esse domínio não aceita email. Confirma o endereço." };
  }

  const locale = await getLocale();
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { isActive: true, unsubscribedAt: null, locale },
    create: { email, locale, source: "rodape" },
  });

  return { ok: true, message: "" };
}

/**
 * Inscreve quem aceitou receber comunicações noutro formulário (por agora, o
 * simulador da landing page). Nunca reativa uma inscrição cancelada: quem
 * cancelou disse que não queria, e uma caixa marcada noutro sítio não desfaz
 * essa vontade.
 */
export async function subscribeFromConsent(email: string, name: string | null, source: string) {
  const limpo = email.trim().toLowerCase();
  if (!limpo) return;

  const existente = await prisma.newsletterSubscriber.findUnique({
    where: { email: limpo },
    select: { id: true, unsubscribedAt: true },
  });

  if (existente) {
    if (existente.unsubscribedAt) return;
    await prisma.newsletterSubscriber.update({
      where: { id: existente.id },
      data: { isActive: true, name: name ?? undefined },
    });
    return;
  }

  await prisma.newsletterSubscriber.create({
    data: { email: limpo, name, source, locale: await getLocale() },
  });
}
