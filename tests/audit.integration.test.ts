import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { createAuditedClient } from "../src/lib/audit/client";
import { auditDate } from "../src/lib/audit/filters";

const url = process.env.AUDIT_TEST_DATABASE_URL;
if (url) {
  const parsed = new URL(url);
  if (!["localhost", "127.0.0.1"].includes(parsed.hostname) || parsed.pathname !== "/audit_test") {
    throw new Error("Audit integration tests require an isolated local database named audit_test.");
  }
}
const base = url ? new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) }) : null;
after(async () => { await base?.$disconnect(); });
const models = Object.values(Prisma.ModelName).map((name) => name[0].toLowerCase() + name.slice(1));
function client(actorId: string) {
  return createAuditedClient(base!, models, async () => ({ source: "ADMIN", actorId, actorName: "Teste", correlationId: randomUUID() }));
}

test("date filters reject invalid dates and include the entire end date", () => {
  assert.equal(auditDate("2026-02-30"), undefined);
  assert.equal(auditDate("invalid"), undefined);
  assert.equal(auditDate("2026-10-25", true)?.toISOString(), "2026-10-26T00:00:00.000Z");
});

test("persistent audit integration", { skip: !base }, async (t) => {
  const prisma = client("audit-admin");
  await t.test("all existing application tables have row triggers", async () => {
    const missing = await base!.$queryRaw<{ tablename: string }[]>`SELECT tablename FROM pg_tables t
      WHERE schemaname = current_schema() AND tablename NOT IN ('AuditLog', '_prisma_migrations')
      AND NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid = format('%I.%I', t.schemaname, t.tablename)::regclass AND tgname = 'apice_audit_row')`;
    assert.deepEqual(missing, []);
  });
  await t.test("create, change password, delete: preserve actor and redact credentials", async () => {
    const user = await prisma.user.create({ data: { name: "Audit test", email: `${randomUUID()}@example.invalid`, passwordHash: "secret-one" } });
    await prisma.user.update({ where: { id: user.id }, data: { passwordHash: "secret-two" } });
    await prisma.user.delete({ where: { id: user.id } });
    const logs = await base!.auditLog.findMany({ where: { entityId: user.id }, orderBy: { createdAt: "asc" } });
    assert.deepEqual(logs.map((l) => l.action), ["CREATE", "UPDATE", "DELETE"]);
    assert.ok(logs.every((l) => l.actorId === "audit-admin"));
    assert.ok(logs[1].changedFields.includes("passwordHash"));
    assert.equal(JSON.stringify(logs).includes("secret-one"), false);
    assert.equal(JSON.stringify(logs).includes("secret-two"), false);
    assert.equal((logs[1].after as Record<string, unknown>).passwordHash, "[Oculto]");
  });
  await t.test("nested creation, batch transactions, bulk updates and cascade deletion", async () => {
    const group = await prisma.group.create({ data: { name: randomUUID(), permissions: { create: [{ resource: "services", canView: true }, { resource: "portfolio", canView: true }] } }, include: { permissions: true } });
    const [updated, count] = await prisma.$transaction([
      prisma.groupPermission.updateMany({ where: { groupId: group.id }, data: { canEdit: true } }),
      prisma.groupPermission.count({ where: { groupId: group.id } }),
    ]);
    assert.equal(updated.count, 2); assert.equal(count, 2);
    await prisma.group.delete({ where: { id: group.id } });
    const logs = await base!.auditLog.findMany({ where: { entityId: { in: [group.id, ...group.permissions.map((p) => p.id)] } } });
    assert.equal(logs.length, 8);
    assert.ok(logs.every((l) => l.actorId === "audit-admin"));
    assert.equal(logs.filter((l) => l.action === "UPDATE").length, 2);
  });
  await t.test("interactive transactions and rolled-back operations", async () => {
    const name = randomUUID();
    await assert.rejects(prisma.$transaction(async (tx) => {
      await tx.group.create({ data: { name } });
      throw new Error("rollback");
    }), /rollback/);
    assert.equal(await base!.group.count({ where: { name } }), 0);
    assert.equal(await base!.auditLog.count({ where: { after: { path: ["name"], equals: name } } }), 0);
    const committed = await prisma.$transaction((tx) => tx.group.create({ data: { name } }));
    assert.equal((await base!.auditLog.findFirstOrThrow({ where: { entityId: committed.id } })).actorId, "audit-admin");
  });
  await t.test("failed batch is atomic, including its logs", async () => {
    const name = randomUUID();
    await assert.rejects(prisma.$transaction([
      prisma.group.create({ data: { name } }), prisma.group.create({ data: { name } }),
    ]));
    assert.equal(await base!.group.count({ where: { name } }), 0);
    assert.equal(await base!.auditLog.count({ where: { after: { path: ["name"], equals: name } } }), 0);
  });
  await t.test("concurrent actors do not leak across pooled connections; unscoped writes use SYSTEM", async () => {
    const [a, b] = await Promise.all([client("actor-a").group.create({ data: { name: randomUUID() } }), client("actor-b").group.create({ data: { name: randomUUID() } })]);
    assert.equal((await base!.auditLog.findFirstOrThrow({ where: { entityId: a.id } })).actorId, "actor-a");
    assert.equal((await base!.auditLog.findFirstOrThrow({ where: { entityId: b.id } })).actorId, "actor-b");
    const unscoped = await base!.group.create({ data: { name: randomUUID() } });
    const log = await base!.auditLog.findFirstOrThrow({ where: { entityId: unscoped.id } });
    assert.equal(log.actorId, null); assert.equal(log.source, "SYSTEM");
  });
  await t.test("recursive redaction and bounded text", async () => {
    const input = JSON.stringify({ config: { apiKey: "hidden", nested: [{ token: "hidden" }] }, bodyHtml: "private mail", title: "x".repeat(3000) });
    const [row] = await base!.$queryRaw<{ value: Record<string, unknown> }[]>`SELECT apice_audit_sanitize(${input}::jsonb) AS value`;
    assert.equal(JSON.stringify(row.value).includes("hidden"), false);
    assert.equal(JSON.stringify(row.value).includes("private mail"), false);
    assert.ok(String(row.value.title).length < 2100);
  });
  await t.test("audit entries cannot be updated, deleted or truncated", async () => {
    const log = await base!.auditLog.findFirstOrThrow();
    await assert.rejects(base!.auditLog.update({ where: { id: log.id }, data: { action: "EDITED" } }));
    await assert.rejects(base!.auditLog.delete({ where: { id: log.id } }));
    await assert.rejects(base!.$executeRaw`TRUNCATE "AuditLog"`);
    assert.ok(await base!.auditLog.findUnique({ where: { id: log.id } }));
  });
});
