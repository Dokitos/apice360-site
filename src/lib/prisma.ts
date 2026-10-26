import { Prisma } from "@/generated/prisma/client";
import { prisma as base } from "@/lib/prisma-base";
import { createAuditedClient } from "@/lib/audit/client";
import { requestAuditContext } from "@/lib/audit/context";

export const prisma = createAuditedClient(base,
  Object.values(Prisma.ModelName).map((name) => name[0].toLowerCase() + name.slice(1)), requestAuditContext);
