import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { clientIpFromHeaders } from "@/lib/rate-limit";
import type { AuditContext } from "./client";
import { auditScope } from "./scope";

export async function requestAuditContext(): Promise<AuditContext> {
  const scoped = auditScope.getStore();
  if (scoped) return scoped;
  let requestHeaders: Headers;
  try { requestHeaders = await headers(); }
  catch { return { source: "SYSTEM", correlationId: randomUUID() }; }
  // Dynamic import avoids a dependency cycle with authentication.
  const { auth } = await import("@/auth");
  const session = await auth();
  return {
    actorId: session?.user.id, actorName: session?.user.name, actorEmail: session?.user.email,
    source: session?.user ? "ADMIN" : "PUBLIC",
    ipAddress: clientIpFromHeaders(requestHeaders).slice(0, 100), correlationId: randomUUID(),
  };
}
