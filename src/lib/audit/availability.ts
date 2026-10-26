import { prisma } from "@/lib/prisma-base";

/** Rolling deployment: existing login/upload flows work before migration. */
export async function auditAvailable() {
  const rows = await prisma.$queryRaw<{ enabled: boolean }[]>`SELECT to_regclass('"AuditLog"') IS NOT NULL AS enabled`;
  return rows[0]?.enabled === true;
}
