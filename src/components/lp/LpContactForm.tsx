"use client";

import { useActionState, useState } from "react";
import { cn } from "@/lib/cn";
import { createLead, type LeadFormState } from "@/app/(public)/actions/leads";
import { checkEmail, checkPhone } from "@/lib/validations/contactable";
import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";

const FIELD_CLASSES =
  "w-full border-b-2 border-outline-variant bg-surface-container-low px-4 py-4 text-on-surface outline-none transition-all placeholder-transparent focus:border-primary focus:ring-0";

/**
 * Formulário de contacto da landing page. A verificação de email/telefone
 * corre primeiro no browser (feedback imediato, sem ida ao servidor) e
 * depois outra vez na server action, que é quem manda.
 */
export function LpContactForm({ locale }: { locale: SiteLocale }) {
  const dict = getDictionary(locale);
  const t = dict.lp.contactForm;
  const st = dict.lp.simulator;

  const [state, formAction, isPending] = useActionState<LeadFormState, FormData>(
    createLead.bind(null, "CONTACT", "/lp#contact"),
    undefined,
  );
  const [errors, setErrors] = useState<{ email?: string; phone?: string }>({});

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-12 text-center">
        <p className="text-lg font-bold text-primary">{state.message}</p>
      </div>
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const data = new FormData(event.currentTarget);
    const next: { email?: string; phone?: string } = {};

    const email = checkEmail(String(data.get("email") ?? ""));
    if (!email.ok) {
      next.email =
        email.reason === "empty"
          ? st.requiredEmail
          : email.reason === "disposable"
            ? st.disposableEmail
            : email.reason === "placeholder"
              ? st.placeholderEmail
              : st.invalidEmail;
    }

    const rawPhone = String(data.get("phone") ?? "").trim();
    if (rawPhone && !checkPhone(rawPhone).ok) next.phone = st.invalidPhone;

    setErrors(next);
    if (Object.keys(next).length > 0) event.preventDefault();
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="relative space-y-8" noValidate>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="floating-label-container">
        <input id="lp-name" name="name" type="text" required placeholder={t.name} className={FIELD_CLASSES} />
        <label htmlFor="lp-name" className="font-mono text-sm uppercase">
          {t.name}
        </label>
      </div>

      <div className="floating-label-container">
        <input
          id="lp-email"
          name="email"
          type="email"
          required
          placeholder={t.email}
          aria-invalid={Boolean(errors.email)}
          onChange={() => setErrors((e) => ({ ...e, email: undefined }))}
          className={cn(FIELD_CLASSES, errors.email && "border-red-500 focus:border-red-500")}
        />
        <label htmlFor="lp-email" className="font-mono text-sm uppercase">
          {t.email}
        </label>
        {errors.email ? <p className="mt-2 text-xs text-red-600">{errors.email}</p> : null}
      </div>

      <div className="floating-label-container">
        <input
          id="lp-phone"
          name="phone"
          type="tel"
          placeholder={t.phone}
          aria-invalid={Boolean(errors.phone)}
          onChange={() => setErrors((e) => ({ ...e, phone: undefined }))}
          className={cn(FIELD_CLASSES, errors.phone && "border-red-500 focus:border-red-500")}
        />
        <label htmlFor="lp-phone" className="font-mono text-sm uppercase">
          {t.phone}
        </label>
        {errors.phone ? <p className="mt-2 text-xs text-red-600">{errors.phone}</p> : null}
      </div>

      <div className="floating-label-container">
        <textarea id="lp-message" name="message" rows={3} placeholder={t.message} className={FIELD_CLASSES} />
        <label htmlFor="lp-message" className="font-mono text-sm uppercase">
          {t.message}
        </label>
      </div>

      {state && !state.ok ? <p className="text-sm text-red-600">{state.message}</p> : null}

      <div className="pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary py-6 text-lg font-bold uppercase text-white shadow-[0_10px_20px_rgba(255,95,0,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(255,95,0,0.5)] disabled:pointer-events-none disabled:opacity-50"
        >
          {isPending ? t.sending : t.submit}
        </button>
        <p className="mt-4 text-center font-mono text-[10px] text-on-surface-variant">{t.privacy}</p>
      </div>
    </form>
  );
}
