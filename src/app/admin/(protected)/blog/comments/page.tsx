import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { QuickActionButton } from "@/components/admin/QuickActionButton";
import { cn } from "@/lib/cn";
import { approveComment, rejectComment, deleteComment } from "./actions";

const STATUSES = [
  { value: "PENDING", label: "Pendentes" },
  { value: "APPROVED", label: "Aprovados" },
  { value: "REJECTED", label: "Rejeitados" },
] as const;

export default async function BlogCommentsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = STATUSES.some((s) => s.value === status) ? (status as string) : "PENDING";

  const comments = await prisma.blogComment.findMany({
    where: { status: activeStatus as "PENDING" | "APPROVED" | "REJECTED" },
    orderBy: { createdAt: "desc" },
    include: { post: { include: { translations: true } } },
  });

  return (
    <div>
      <AdminPageHeader title="Comentários" description="Moderação de comentários do Blog." />

      <div className="mb-6 flex gap-2 border-b border-outline-variant/20">
        {STATUSES.map((s) => (
          <Link
            key={s.value}
            href={`/admin/blog/comments?status=${s.value}`}
            className={cn(
              "px-4 py-2 font-mono text-label-mono uppercase tracking-widest transition-colors",
              activeStatus === s.value
                ? "border-b-2 border-primary text-primary"
                : "text-on-surface-variant hover:text-on-surface",
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <DataTable
        rows={comments}
        getRowId={(c) => c.id}
        emptyMessage="Sem comentários nesta categoria."
        columns={[
          { header: "Autor", render: (c) => <span className="font-bold">{c.authorName}</span> },
          {
            header: "Artigo",
            render: (c) => c.post.translations.find((t) => t.locale === "PT")?.title ?? "—",
          },
          {
            header: "Comentário",
            render: (c) => <span className="line-clamp-2 max-w-sm text-xs text-on-surface-variant">{c.body}</span>,
          },
        ]}
        renderActions={(c) => (
          <div className="flex items-center justify-end gap-2">
            {activeStatus !== "APPROVED" ? (
              <QuickActionButton
                action={approveComment.bind(null, c.id)}
                icon="check_circle"
                label="Aprovar"
                successMessage="Comentário aprovado."
              />
            ) : null}
            {activeStatus !== "REJECTED" ? (
              <QuickActionButton
                action={rejectComment.bind(null, c.id)}
                icon="cancel"
                label="Rejeitar"
                successMessage="Comentário rejeitado."
              />
            ) : null}
            <DeleteButton action={deleteComment.bind(null, c.id)} />
          </div>
        )}
      />
    </div>
  );
}
