"use client";

import { useActionState } from "react";
import Link from "next/link";
import { subscribeToNewsletter, type NewsletterState } from "@/app/(public)/actions/newsletter";
import { Icon } from "@/components/ui/Icon";

type Labels = {
  heading: string;
  body: string;
  placeholder: string;
  button: string;
  success: string;
  error: string;
  consent: string;
};

/** Inscrição na newsletter, no rodapé. */
export function NewsletterForm({ labels }: { labels: Labels }) {
  const [state, formAction, isPending] = useActionState<NewsletterState, FormData>(
    subscribeToNewsletter,
    undefined,
  );

  if (state?.ok) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-primary/40 bg-primary/10 p-4">
        <Icon name="mark_email_read" className="shrink-0 text-primary" />
        <p className="text-sm text-gray-200">{labels.success}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-3">
      <h4 className="font-heading text-base font-bold text-white">{labels.heading}</h4>
      <p className="text-sm leading-relaxed">{labels.body}</p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <label htmlFor="newsletter-email" className="sr-only">
          {labels.placeholder}
        </label>
        <input
          id="newsletter-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder={labels.placeholder}
          className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-primary"
        />
        <button
          type="submit"
          disabled={isPending}
          className="shrink-0 rounded-lg bg-primary px-5 py-3 text-xs font-bold uppercase tracking-wide text-on-primary transition-transform hover:scale-105 disabled:opacity-60"
        >
          {isPending ? "..." : labels.button}
        </button>
      </div>

      {/* Honeypot: invisível para pessoas, irresistível para bots. */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      {state && !state.ok ? (
        <p className="text-xs text-primary">{state.message || labels.error}</p>
      ) : (
        <p className="text-xs text-gray-500">
          <Link href="/privacidade" className="underline hover:text-gray-300">
            {labels.consent}
          </Link>
        </p>
      )}
    </form>
  );
}
