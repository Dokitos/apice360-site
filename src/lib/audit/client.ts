/* eslint-disable @typescript-eslint/no-explicit-any -- Proxy preserves Prisma's overloaded generic API. */
export type AuditContext = { actorId?: string | null; actorName?: string | null; actorEmail?: string | null; source: string; ipAddress?: string | null; correlationId?: string };
const mutations = new Set(["create", "createMany", "createManyAndReturn", "update", "updateMany", "updateManyAndReturn", "upsert", "delete", "deleteMany"]);

/** Set transaction-local attribution, including nested writes and batch transactions. */
export function createAuditedClient<T extends object>(base: T, models: string[], context: () => Promise<AuditContext>): T {
  const client = base as any;
  const originals = new WeakMap<object, any>();
  const delegates = new Map<string, any>();
  const setContext = (tx: any, value: AuditContext) => tx.$queryRaw`SELECT set_config('apice.audit_context', ${JSON.stringify(value)}, true)`;
  function lazy(original: any, run: () => Promise<any>) {
    let execution: Promise<any> | undefined;
    const execute = () => execution ??= run();
    const wrapped = new Proxy(original, {
      get(target, key) {
        if (key === "then") return (ok: any, fail: any) => execute().then(ok, fail);
        if (key === "catch") return (fail: any) => execute().catch(fail);
        if (key === "finally") return (fn: any) => execute().finally(fn);
        const value = Reflect.get(target, key);
        return typeof value === "function" ? value.bind(target) : value;
      },
    });
    originals.set(wrapped, original);
    return wrapped;
  }
  return new Proxy(base, {
    get(target, key: string) {
      if (key === "$transaction") return async (operations: any, options?: any) => {
        const value = await context();
        if (Array.isArray(operations)) {
          const results = await client.$transaction([setContext(client, value), ...operations.map((op: any) => originals.get(op) ?? op)], options);
          return results.slice(1);
        }
        return client.$transaction(async (tx: any) => { await setContext(tx, value); return operations(tx); }, options);
      };
      if (models.includes(key) && key !== "auditLog") {
        if (!delegates.has(key)) delegates.set(key, new Proxy(client[key], {
          get(delegate, operation: string) {
            const method = delegate[operation];
            if (typeof method !== "function") return method;
            if (!mutations.has(operation)) return method.bind(delegate);
            return (...args: any[]) => lazy(method.apply(delegate, args), async () => {
              const value = await context();
              return client.$transaction(async (tx: any) => { await setContext(tx, value); return tx[key][operation](...args); });
            });
          },
        }));
        return delegates.get(key);
      }
      const value = Reflect.get(target, key);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}
