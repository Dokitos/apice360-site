"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  leadSchema,
  lpSimulatorIdentitySchema,
  EMAIL_ISSUE_MESSAGES,
} from "@/lib/validations/public";
import { domainAcceptsMail } from "@/lib/validations/contactable.server";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { getLocale } from "@/lib/locale";
import { getLpSimulatorFields } from "@/lib/content";
import { subscribeFromConsent } from "@/app/(public)/actions/newsletter";
import {
  MIN_SQUARE_METERS,
  MAX_SQUARE_METERS,
  isSystemKey,
} from "@/lib/lp-simulator";

export type LeadFormState = { ok: boolean; message: string } | undefined;

export async function createLead(
  type: "CONTACT" | "BUDGET" | "ARCHITECT_PARTNERSHIP",
  sourcePage: string,
  _prevState: LeadFormState,
  formData: FormData,
): Promise<LeadFormState> {
  const parsed = leadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    message: formData.get("message") || undefined,
    company: formData.get("company") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const ip = clientIpFromHeaders(await headers());
  const { ok: withinLimit } = rateLimit(`lead-form:${ip}`, 5, 60_000);
  if (!withinLimit) {
    return { ok: false, message: "Demasiados pedidos. Tenta novamente dentro de instantes." };
  }

  // Honeypot triggered — silently pretend success so bots don't learn to adapt.
  if (parsed.data.company) {
    return { ok: true, message: "Mensagem enviada com sucesso. Entraremos em contacto brevemente." };
  }

  if (!(await domainAcceptsMail(parsed.data.email))) {
    return { ok: false, message: EMAIL_ISSUE_MESSAGES.no_mail_server };
  }

  await prisma.leadSubmission.create({
    data: {
      type,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message || null,
      sourcePage,
      locale: await getLocale(),
    },
  });

  return { ok: true, message: "Mensagem enviada com sucesso. Entraremos em contacto brevemente." };
}

export type SimulatorLeadState =
  | { ok: true }
  // `field` é a chave do campo que falhou — uma das do sistema ou qualquer
  // outra criada no painel —, para o formulário voltar ao passo certo.
  | { ok: false; message: string; field?: string }
  | undefined;

/**
 * Grava a lead do simulador da landing page. Corre antes de a estimativa ser
 * revelada — o preço é a contrapartida pelos dados de contacto, por isso o
 * cliente só vê os cartões depois de esta ação devolver `ok`.
 */
export async function createSimulatorLead(
  _prevState: SimulatorLeadState,
  formData: FormData,
): Promise<SimulatorLeadState> {
  const locale = await getLocale();

  // As perguntas vêm da base de dados (painel → Landing Page → Campos do
  // Simulador), por isso o que é obrigatório e o que é sequer aceite também
  // vem de lá. As respostas são guardadas pelo rótulo em Português, que é o
  // idioma em que a equipa lê as leads, mesmo quando quem preencheu estava
  // noutro idioma.
  const fields = await getLpSimulatorFields("PT");

  // Honeypot: devolve sucesso para o bot não perceber que foi apanhado.
  if (String(formData.get("company") ?? "")) return { ok: true };

  const valores = new Map<string, string>();
  for (const field of fields) {
    valores.set(field.key, String(formData.get(field.key) ?? "").trim().slice(0, 500));
  }

  const nome = valores.get("name") ?? "";
  const email = valores.get("email") ?? "";
  const telefone = valores.get("phone") ?? "";

  const identidade = lpSimulatorIdentitySchema.safeParse({ name: nome, email, phone: telefone });
  if (!identidade.success) {
    const issue = identidade.error.issues[0];
    const field = issue?.path[0];
    return {
      ok: false,
      message: issue?.message ?? "Dados inválidos.",
      field: typeof field === "string" ? (field as "name" | "email" | "phone") : undefined,
    };
  }

  const metros = Number.parseInt(valores.get("squareMeters") ?? "", 10);
  if (!Number.isFinite(metros) || metros < MIN_SQUARE_METERS || metros > MAX_SQUARE_METERS) {
    return {
      ok: false,
      message: `Indica uma área entre ${MIN_SQUARE_METERS} e ${MAX_SQUARE_METERS} m².`,
      field: "squareMeters",
    };
  }

  // Os campos que o painel marcou como obrigatórios. Os do sistema já foram
  // verificados acima, com as regras próprias de cada um.
  for (const field of fields) {
    if (!field.isRequired || isSystemKey(field.key)) continue;
    if (!valores.get(field.key)) {
      return { ok: false, message: `Preenche o campo "${field.label}".`, field: field.key };
    }
  }

  const ip = clientIpFromHeaders(await headers());
  const { ok: withinLimit } = rateLimit(`lp-simulator:${ip}`, 5, 60_000);
  if (!withinLimit) {
    return { ok: false, message: "Demasiados pedidos. Tenta novamente dentro de instantes." };
  }

  if (!(await domainAcceptsMail(identidade.data.email))) {
    return { ok: false, message: EMAIL_ISSUE_MESSAGES.no_mail_server, field: "email" };
  }

  const aceitaMarketing = String(formData.get("marketingConsent") ?? "") === "on";

  await prisma.leadSubmission.create({
    data: {
      type: "BUDGET",
      name: identidade.data.name,
      email: identidade.data.email,
      phone: identidade.data.phone,
      marketingConsent: aceitaMarketing,
      // Nome, email e telefone têm colunas próprias; o resto das respostas
      // vai para a mensagem, uma por linha, com o rótulo da pergunta — é
      // assim que uma pergunta criada no painel chega à página de Leads sem
      // ninguém ter de mexer em código.
      message: fields
        .filter((field) => !["name", "email", "phone"].includes(field.key))
        .map((field) => `${field.label}: ${valores.get(field.key) || "não informado"}`)
        .join("\n"),
      sourcePage: "/lp#simulador",
      locale,
    },
  });

  // A inscrição vive à parte da lead: cancelar a newsletter não pode
  // depender de mexer no histórico comercial.
  if (aceitaMarketing) {
    await subscribeFromConsent(identidade.data.email, identidade.data.name, "simulador");
  }

  return { ok: true };
}
