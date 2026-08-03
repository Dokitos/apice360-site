"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/lib/validations/public";

export type CommentFormState = { ok: boolean; message: string } | undefined;

export async function submitComment(
  postId: string,
  postSlug: string,
  _prevState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  const parsed = commentSchema.safeParse({
    authorName: formData.get("authorName"),
    authorEmail: formData.get("authorEmail"),
    body: formData.get("body"),
    company: formData.get("company") || undefined,
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  if (parsed.data.company) {
    return { ok: true, message: "Comentário enviado. Fica visível após aprovação." };
  }

  await prisma.blogComment.create({
    data: {
      postId,
      authorName: parsed.data.authorName,
      authorEmail: parsed.data.authorEmail,
      body: parsed.data.body,
      status: "PENDING",
    },
  });

  revalidatePath(`/blog/${postSlug}`);
  return { ok: true, message: "Comentário enviado. Fica visível após aprovação." };
}
