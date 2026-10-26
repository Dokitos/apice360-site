import { headers } from "next/headers";
import { prisma } from "@/lib/prisma-base";
import { clientIpFromHeaders } from "@/lib/rate-limit";
import { auditAvailable } from "./availability";

type Actor = { id?: string | null; name?: string | null; email?: string | null };

/** Access/storage events; database mutations are captured by row triggers. */
export async function recordAuditEvent(action: string, actor?: Actor, entity = "Auth", entityId?: string) {
  if (!await auditAvailable()) return;
  let ipAddress: string | undefined;
  try { ipAddress = clientIpFromHeaders(await headers()).slice(0, 100); } catch { /* Background event. */ }
  await prisma.auditLog.create({ data: {
    action, entity, entityId: entityId?.slice(0, 500),
    actorId: actor?.id, actorName: actor?.name?.slice(0, 200), actorEmail: actor?.email?.slice(0, 320),
    source: entity === "Auth" ? "AUTH" : actor?.id ? "ADMIN" : "SYSTEM", ipAddress,
  } });
}
