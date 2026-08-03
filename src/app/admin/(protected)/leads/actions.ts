"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireEditorOrAdmin } from "@/lib/permissions";

const NEXT_STATUS: Record<string, "NEW" | "CONTACTED" | "CLOSED"> = {
  NEW: "CONTACTED",
  CONTACTED: "CLOSED",
  CLOSED: "NEW",
};

export async function advanceLeadStatus(id: string, currentStatus: string) {
  await requireEditorOrAdmin();
  await prisma.leadSubmission.update({
    where: { id },
    data: { status: NEXT_STATUS[currentStatus] ?? "NEW" },
  });
  revalidatePath("/admin/leads");
}

export async function deleteLead(id: string) {
  await requireEditorOrAdmin();
  await prisma.leadSubmission.delete({ where: { id } });
  revalidatePath("/admin/leads");
}
