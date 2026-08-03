"use client";

import { useActionState } from "react";
import { createLead, type LeadFormState } from "@/app/(public)/actions/leads";
import { Button } from "@/components/ui/Button";
import { FloatingLabelInput, FloatingLabelTextarea } from "@/components/ui/FloatingLabelInput";

type ContactFormProps = {
  type?: "CONTACT" | "BUDGET" | "ARCHITECT_PARTNERSHIP";
  sourcePage?: string;
};

export function ContactForm({ type = "CONTACT", sourcePage = "/contacto" }: ContactFormProps) {
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
      <FloatingLabelInput id="name" name="name" label="Nome Completo" type="text" required />
      <FloatingLabelInput id="email" name="email" label="Endereço de Email" type="email" required />
      <FloatingLabelInput id="phone" name="phone" label="Número de Contacto" type="tel" />
      <FloatingLabelTextarea id="message" name="message" label="Mensagem" />
      {state && !state.ok ? <p className="text-sm text-primary">{state.message}</p> : null}
      <Button type="submit" variant="cta" className="w-full" disabled={isPending}>
        {isPending ? "A enviar..." : "Enviar Contacto"}
      </Button>
    </form>
  );
}
