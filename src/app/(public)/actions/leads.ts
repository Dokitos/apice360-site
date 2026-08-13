"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/validations/public";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";

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

  await prisma.leadSubmission.create({
    data: {
      type,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone || null,
      message: parsed.data.message || null,
      sourcePage,
      locale: "PT",
    },
  });

  return { ok: true, message: "Mensagem enviada com sucesso. Entraremos em contacto brevemente." };
}
