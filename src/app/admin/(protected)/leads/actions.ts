"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/permissions";

const STATUS_LABEL: Record<string, string> = {
  NEW: "Novo",
  CONTACTED: "Contactado",
  QUALIFIED: "Qualificado",
  WON: "Ganho",
  LOST: "Perdido",
};

const VALID_STATUSES = new Set(Object.keys(STATUS_LABEL));

function revalidateLead(id: string) {
  revalidatePath("/admin/leads");
  revalidatePath(`/admin/leads/${id}`);
  revalidatePath("/admin");
}

export async function setLeadStatus(id: string, status: string) {
  const user = await requireEditorOrAdmin();
  if (!VALID_STATUSES.has(status)) throw new Error("Estado inválido.");

  const current = await prisma.leadSubmission.findUniqueOrThrow({ where: { id }, select: { status: true } });
  if (current.status === status) return;

  await prisma.$transaction([
    prisma.leadSubmission.update({
      where: { id },
      data: { status: status as "NEW" | "CONTACTED" | "QUALIFIED" | "WON" | "LOST" },
    }),
    prisma.leadActivity.create({
      data: {
        leadId: id,
        type: "STATUS_CHANGE",
        note: `${STATUS_LABEL[current.status]} → ${STATUS_LABEL[status]}`,
        userId: user.id,
      },
    }),
  ]);

  revalidateLead(id);
}

export async function updateLeadNotes(id: string, notes: string) {
  const user = await requireEditorOrAdmin();
  const trimmed = notes.trim();

  await prisma.$transaction([
    prisma.leadSubmission.update({ where: { id }, data: { notes: trimmed || null } }),
    prisma.leadActivity.create({
      data: {
        leadId: id,
        type: "NOTE",
        note: trimmed || "Notas removidas.",
        userId: user.id,
      },
    }),
  ]);

  revalidateLead(id);
}

export async function assignLead(id: string, userId: string) {
  const user = await requireEditorOrAdmin();
  const targetId = userId || null;

  const target = targetId ? await prisma.user.findUnique({ where: { id: targetId }, select: { name: true } }) : null;

  await prisma.$transaction([
    prisma.leadSubmission.update({ where: { id }, data: { assignedToId: targetId } }),
    prisma.leadActivity.create({
      data: {
        leadId: id,
        type: "ASSIGNMENT",
        note: target ? `Atribuído a ${target.name}` : "Atribuição removida",
        userId: user.id,
      },
    }),
  ]);

  revalidateLead(id);
}

export async function logCallAttempt(id: string) {
  const user = await requireEditorOrAdmin();
  const lead = await prisma.leadSubmission.findUniqueOrThrow({ where: { id }, select: { status: true } });

  await prisma.$transaction([
    ...(lead.status === "NEW"
      ? [prisma.leadSubmission.update({ where: { id }, data: { status: "CONTACTED" as const } })]
      : []),
    prisma.leadActivity.create({
      data: { leadId: id, type: "CALL_LOGGED", note: "Chamada registada", userId: user.id },
    }),
  ]);

  revalidateLead(id);
}

export async function logEmailSent(id: string) {
  const user = await requireEditorOrAdmin();
  const lead = await prisma.leadSubmission.findUniqueOrThrow({ where: { id }, select: { status: true } });

  await prisma.$transaction([
    ...(lead.status === "NEW"
      ? [prisma.leadSubmission.update({ where: { id }, data: { status: "CONTACTED" as const } })]
      : []),
    prisma.leadActivity.create({
      data: { leadId: id, type: "EMAIL_LOGGED", note: "Email registado", userId: user.id },
    }),
  ]);

  revalidateLead(id);
}

export async function deleteLead(id: string) {
  await requireEditorOrAdmin();
  await prisma.leadSubmission.delete({ where: { id } });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function bulkSetStatus(ids: string[], status: string) {
  const user = await requireEditorOrAdmin();
  if (!VALID_STATUSES.has(status) || ids.length === 0) return;

  await prisma.$transaction([
    prisma.leadSubmission.updateMany({
      where: { id: { in: ids } },
      data: { status: status as "NEW" | "CONTACTED" | "QUALIFIED" | "WON" | "LOST" },
    }),
    prisma.leadActivity.createMany({
      data: ids.map((leadId) => ({
        leadId,
        type: "STATUS_CHANGE" as const,
        note: `Alterado em massa para ${STATUS_LABEL[status]}`,
        userId: user.id,
      })),
    }),
  ]);

  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function bulkDeleteLeads(ids: string[]) {
  await requireEditorOrAdmin();
  if (ids.length === 0) return;
  await prisma.leadSubmission.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}
