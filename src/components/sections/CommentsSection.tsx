"use client";

import { useActionState } from "react";
import { submitComment, type CommentFormState } from "@/app/(public)/actions/comments";
import { Button } from "@/components/ui/Button";
import { FloatingLabelInput, FloatingLabelTextarea } from "@/components/ui/FloatingLabelInput";
import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";

type Comment = { id: string; authorName: string; body: string; createdAt: Date };

type CommentsSectionProps = {
  postId: string;
  postSlug: string;
  comments: Comment[];
  locale: SiteLocale;
};

export function CommentsSection({ postId, postSlug, comments, locale }: CommentsSectionProps) {
  const dict = getDictionary(locale);
  const [state, formAction, isPending] = useActionState<CommentFormState, FormData>(
    submitComment.bind(null, postId, postSlug),
    undefined,
  );

  return (
    <div className="mt-20 border-t border-outline-variant/20 pt-16">
      <h3 className="mb-8 font-heading text-headline-md">{dict.commentsSection.comentarios(comments.length)}</h3>

      <div className="mb-12 space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="rounded-lg bg-surface-container-low p-6">
            <p className="mb-2 leading-relaxed text-on-surface">{comment.body}</p>
            <p className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
              {comment.authorName}
            </p>
          </div>
        ))}
      </div>

      {state?.ok ? (
        <p className="text-sm text-primary">{state.message}</p>
      ) : (
        <form action={formAction} className="space-y-6">
          <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FloatingLabelInput id="authorName" name="authorName" label={dict.commentsSection.nome} type="text" required />
            <FloatingLabelInput id="authorEmail" name="authorEmail" label={dict.commentsSection.email} type="email" required />
          </div>
          <FloatingLabelTextarea id="body" name="body" label={dict.commentsSection.corpo} required />
          {state && !state.ok ? <p className="text-sm text-primary">{state.message}</p> : null}
          <Button type="submit" variant="cta-outline" disabled={isPending}>
            {isPending ? dict.commentsSection.aEnviar : dict.commentsSection.comentar}
          </Button>
        </form>
      )}
    </div>
  );
}
