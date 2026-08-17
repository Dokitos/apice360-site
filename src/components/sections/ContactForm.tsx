"use client";

import { useActionState } from "react";
import { createLead, type LeadFormState } from "@/app/(public)/actions/leads";
import { Button } from "@/components/ui/Button";
import { FloatingLabelInput, FloatingLabelTextarea } from "@/components/ui/FloatingLabelInput";
import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";

type ContactFormProps = {
  type?: "CONTACT" | "BUDGET" | "ARCHITECT_PARTNERSHIP";
  sourcePage?: string;
  locale?: SiteLocale;
};

export function ContactForm({ type = "CONTACT", sourcePage = "/contacto", locale = "PT" }: ContactFormProps) {
  const dict = getDictionary(locale);
  const [state, formAction, isPending] = useActionState<LeadFormState, FormData>(
    createLead.bind(null, type, sourcePage),
    undefined,
  );

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-12 text-center">
        <p className="text-lg font-bold text-primary">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-8">
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
      <FloatingLabelInput id="name" name="name" label={dict.contactForm.nomeCompleto} type="text" required />
      <FloatingLabelInput id="email" name="email" label={dict.contactForm.email} type="email" required />
      <FloatingLabelInput id="phone" name="phone" label={dict.contactForm.telefone} type="tel" />
      <FloatingLabelTextarea id="message" name="message" label={dict.contactForm.mensagem} />
      {state && !state.ok ? <p className="text-sm text-primary">{state.message}</p> : null}
      <Button type="submit" variant="cta" className="w-full" disabled={isPending}>
        {isPending ? dict.contactForm.aEnviar : dict.contactForm.enviar}
      </Button>
    </form>
  );
}
