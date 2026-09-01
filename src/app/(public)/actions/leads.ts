"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import {
  leadSchema,
  lpSimulatorLeadSchema,
  EMAIL_ISSUE_MESSAGES,
} from "@/lib/validations/public";
import { domainAcceptsMail } from "@/lib/validations/contactable.server";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";
import { getLocale } from "@/lib/locale";

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
  | { ok: false; message: string; field?: "name" | "email" | "phone" | "squareMeters" }
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
  const parsed = lpSimulatorLeadSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    buildLocation: formData.get("buildLocation") || undefined,
    hasLand: formData.get("hasLand") || undefined,
    hasProject: formData.get("hasProject") || undefined,
    floors: formData.get("floors") || undefined,
    squareMeters: formData.get("squareMeters"),
    company: formData.get("company") || undefined,
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path[0];
    return {
      ok: false,
      message: issue?.message ?? "Dados inválidos.",
      field: typeof field === "string" ? (field as "name" | "email" | "phone" | "squareMeters") : undefined,
    };
  }

  const ip = clientIpFromHeaders(await headers());
  const { ok: withinLimit } = rateLimit(`lp-simulator:${ip}`, 5, 60_000);
  if (!withinLimit) {
    return { ok: false, message: "Demasiados pedidos. Tenta novamente dentro de instantes." };
  }

  // Honeypot: devolve sucesso para o bot não perceber que foi apanhado.
  if (parsed.data.company) return { ok: true };

  if (!(await domainAcceptsMail(parsed.data.email))) {
    return { ok: false, message: EMAIL_ISSUE_MESSAGES.no_mail_server, field: "email" };
  }

  const d = parsed.data;
  await prisma.leadSubmission.create({
    data: {
      type: "BUDGET",
      name: d.name,
      email: d.email,
      phone: d.phone,
      message: [
        `Localização onde pretende construir: ${d.buildLocation || "não informado"}`,
        `Já tem terreno: ${d.hasLand || "não informado"}`,
        `Já possui projeto de arquitetura: ${d.hasProject || "não informado"}`,
        `Nº de pisos: ${d.floors || "não informado"}`,
        `Metros quadrados pretendidos: ${d.squareMeters} m²`,
      ].join("\n"),
      sourcePage: "/lp#simulador",
      locale: await getLocale(),
    },
  });

  return { ok: true };
}
