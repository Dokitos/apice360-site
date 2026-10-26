import { AsyncLocalStorage } from "node:async_hooks";
import type { AuditContext } from "./client";

/** Trusted server code can identify background integrations without user cookies. */
export const auditScope = new AsyncLocalStorage<AuditContext>();
