"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";

export async function approveComment(id: string) {
  await requirePermission("blog_comments", "edit");
  await prisma.blogComment.update({ where: { id }, data: { status: "APPROVED" } });
  revalidatePath("/admin/blog/comments");
  revalidatePath("/blog");
}

export async function rejectComment(id: string) {
  await requirePermission("blog_comments", "edit");
  await prisma.blogComment.update({ where: { id }, data: { status: "REJECTED" } });
  revalidatePath("/admin/blog/comments");
  revalidatePath("/blog");
}

export async function deleteComment(id: string) {
  await requirePermission("blog_comments", "delete");
  await prisma.blogComment.delete({ where: { id } });
  revalidatePath("/admin/blog/comments");
  revalidatePath("/blog");
}
