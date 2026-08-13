"use server";

import { headers } from "next/headers";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { clientIpFromHeaders, rateLimit } from "@/lib/rate-limit";

export async function loginAction(_prevState: string | undefined, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const ip = clientIpFromHeaders(await headers());

  // Throttle by IP+email (blocks credential stuffing against one account)
  // and by IP alone (blocks spraying many emails from one source).
  const { ok: withinAccountLimit } = rateLimit(`login:${ip}:${email}`, 5, 15 * 60_000);
  const { ok: withinIpLimit } = rateLimit(`login-ip:${ip}`, 20, 15 * 60_000);
  if (!withinAccountLimit || !withinIpLimit) {
    return "Demasiadas tentativas. Tenta novamente dentro de alguns minutos.";
  }

  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/admin",
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return "Email ou palavra-passe incorretos.";
    }
    throw error;
  }
}
