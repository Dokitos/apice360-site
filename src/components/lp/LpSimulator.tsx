"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { createSimulatorLead } from "@/app/(public)/actions/leads";
import { checkEmail, checkPhone } from "@/lib/validations/contactable";
import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";

export type PriceTier = {
  id: string;
  key: string;
  pricePerM2: number;
  isHighlighted: boolean;
  iconName: string | null;
  label: string;
  description: string | null;
  features: string[];
};

type LpSimulatorProps = {
  locale: SiteLocale;
  heading: string;
  subheading?: string | null;
  tiers: PriceTier[];
  whatsappNumber: string;
};

type Stage = "form" | "loading" | "result";
type FieldErrors = Partial<Record<"name" | "email" | "phone" | "buildLocation" | "squareMeters", string>>;

const FIELD_CLASSES =
  "w-full border-b-2 border-outline-variant bg-surface-container-low px-4 py-4 text-on-surface outline-none transition-all placeholder-transparent focus:border-primary focus:ring-0";

const FIELD_ERROR_CLASSES = "border-red-500 focus:border-red-500";

// Botão primário de cada passo. `flex-1` (e não `w-full`) porque nos passos 2
// e 3 ele divide a linha com o "Voltar": com `w-full` o flex encolhia-o até à
// largura exata do texto e as letras ficavam coladas às bordas.
//
// O corpo de texto está calibrado para o rótulo caber sempre numa linha
// (`whitespace-nowrap`) no idioma mais comprido, o PT: a 18px ocupa 293px e
// só há 282px úteis ao lado do "Voltar"; a 16px passa a 260px. Em ecrãs
// pequenos os dois botões empilham e o limite desce para 15px.
const SUBMIT_BUTTON_CLASSES =
  "flex min-w-0 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-5 text-[15px] font-bold uppercase text-white shadow-[0_10px_20px_rgba(255,95,0,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(255,95,0,0.5)] sm:text-base";

const BACK_BUTTON_CLASSES =
  "shrink-0 rounded-lg border border-outline-variant px-4 py-4 text-sm font-bold uppercase transition-colors hover:bg-surface-container-high";

/** Linha "Voltar + avançar": empilha em ecrãs estreitos, onde não há largura para os dois. */
const STEP_ACTIONS_ROW = "mt-10 flex flex-col gap-4 sm:flex-row";

export function LpSimulator({ locale, heading, subheading, tiers, whatsappNumber }: LpSimulatorProps) {
  const dict = getDictionary(locale);
  const t = dict.lp.simulator;

  const [step, setStep] = useState(1);
  const [stage, setStage] = useState<Stage>("form");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [emailHint, setEmailHint] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const wizardRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    hasLand: "",
    hasProject: "",
    buildLocation: "",
    floors: t.floors1,
    squareMeters: "",
    // Honeypot: fica sempre vazio para pessoas; se vier preenchido, o
    // servidor finge sucesso e não grava nada.
    company: "",
  });

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  const fmtEUR = useMemo(
    () => (value: number) => `${value.toLocaleString(localeTag(locale), { maximumFractionDigits: 0 })} €`,
    [locale],
  );

  const squareMeters = Number.parseInt(form.squareMeters, 10) || 0;

  /** Passo 1: nome + email + telefone, todos verificados antes de avançar. */
  function validateStep1(): boolean {
    const next: FieldErrors = {};
    setEmailHint(null);

    if (form.name.trim().length < 2) next.name = t.requiredName;

    const email = checkEmail(form.email);
    if (!email.ok) {
      next.email =
        email.reason === "empty"
          ? t.requiredEmail
          : email.reason === "disposable"
            ? t.disposableEmail
            : email.reason === "placeholder"
              ? t.placeholderEmail
              : t.invalidEmail;
    } else if (email.suggestion) {
      setEmailHint(t.emailSuggestion(email.suggestion));
    }

    const phone = checkPhone(form.phone);
    if (!phone.ok) next.phone = phone.reason === "empty" ? t.requiredPhone : t.invalidPhone;

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateStep2(): boolean {
    const next: FieldErrors = {};
    if (!form.buildLocation.trim()) next.buildLocation = t.requiredLocation;
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goToStep(n: number) {
    setStep(n);
    setServerError(null);
    wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit() {
    if (squareMeters < 20) {
      setErrors({ squareMeters: t.squareMetersHint });
      return;
    }

    setServerError(null);
    setStage("loading");

    const data = new FormData();
    Object.entries(form).forEach(([key, value]) => data.set(key, value));

    // A estimativa é a contrapartida pelos dados: só a mostramos depois de a
    // lead ficar mesmo gravada (e o email/telefone passarem no servidor).
    const [result] = await Promise.all([
      createSimulatorLead(undefined, data),
      // Mantém o "a calcular..." visível o tempo suficiente para ser lido.
      new Promise((resolve) => setTimeout(resolve, 1600)),
    ]);

    if (!result || !result.ok) {
      setStage("form");
      setServerError(result?.message ?? t.invalidEmail);
      if (result?.field) {
        setErrors({ [result.field]: result.message } as FieldErrors);
        setStep(result.field === "squareMeters" ? 3 : 1);
      }
      return;
    }

    setStage("result");
  }

  function restart() {
    setStage("form");
    setStep(1);
    setErrors({});
    setServerError(null);
    wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function whatsappHref(tier: PriceTier) {
    const message = [
      t.waIntro,
      `${t.name}: ${form.name}`,
      `${t.email}: ${form.email}`,
      `${t.phone}: ${form.phone}`,
      `${t.buildLocation}: ${form.buildLocation || "—"}`,
      `${t.hasLand} ${form.hasLand || "—"}`,
      `${t.hasProject} ${form.hasProject || "—"}`,
      `${t.floors}: ${form.floors}`,
      `${t.squareMeters}: ${squareMeters} m²`,
      `${tier.label}: ${fmtEUR(squareMeters * tier.pricePerM2)} ${t.plusVat}`,
    ].join("\n");
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  return (
    <Reveal
      as="section"
      id="simulador"
      className="relative z-20 border-t border-outline-variant/10 bg-surface-container-lowest py-32"
    >
      <div className={cn("mx-auto px-5 md:px-20", stage === "result" ? "max-w-6xl" : "max-w-2xl")}>
        <div className="mb-12 text-center">
          <h2 className="mb-4 font-heading text-headline-lg">{heading}</h2>
          {subheading ? (
            <p className="text-sm leading-relaxed text-on-surface-variant md:text-base">{subheading}</p>
          ) : null}
        </div>

        <div ref={wizardRef} className="neon-border relative rounded-2xl bg-surface p-8 text-left md:p-12">
          {stage === "form" ? (
            <>
              <div className="mb-10 flex items-center gap-2">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors",
                      n <= step ? "bg-primary" : "bg-outline-variant",
                    )}
                  />
                ))}
              </div>

              {step === 1 ? (
                <div>
                  <p className="mb-6 font-mono text-xs uppercase tracking-widest text-primary">{t.step1Label}</p>
                  <div className="space-y-6">
                    <Field
                      id="sim-name"
                      label={t.name}
                      value={form.name}
                      onChange={(v) => set("name", v)}
                      error={errors.name}
                      autoComplete="name"
                    />
                    <div className="grid gap-6 sm:grid-cols-2">
                      <Field
                        id="sim-email"
                        label={t.email}
                        type="email"
                        value={form.email}
                        onChange={(v) => set("email", v)}
                        error={errors.email}
                        hint={emailHint}
                        autoComplete="email"
                      />
                      <Field
                        id="sim-phone"
                        label={t.phone}
                        type="tel"
                        value={form.phone}
                        onChange={(v) => set("phone", v)}
                        error={errors.phone}
                        autoComplete="tel"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (validateStep1()) goToStep(2);
                    }}
                    className={cn(SUBMIT_BUTTON_CLASSES, "mt-10")}
                  >
                    {t.continueLabel}
                    <Icon name="arrow_forward" />
                  </button>
                </div>
              ) : null}

              {step === 2 ? (
                <div>
                  <p className="mb-6 font-mono text-xs uppercase tracking-widest text-primary">{t.step2Label}</p>
                  <div className="space-y-8">
                    <ChoiceGroup
                      label={t.hasLand}
                      value={form.hasLand}
                      options={[t.yes, t.no]}
                      onChange={(v) => set("hasLand", v)}
                    />
                    <ChoiceGroup
                      label={t.hasProject}
                      value={form.hasProject}
                      options={[t.yes, t.no]}
                      onChange={(v) => set("hasProject", v)}
                    />
                    <Field
                      id="sim-build-location"
                      label={t.buildLocation}
                      value={form.buildLocation}
                      onChange={(v) => set("buildLocation", v)}
                      error={errors.buildLocation}
                      hint={errors.buildLocation ? null : t.buildLocationHint}
                    />
                  </div>
                  <div className={STEP_ACTIONS_ROW}>
                    <button
                      type="button"
                      onClick={() => goToStep(1)}
                      className={BACK_BUTTON_CLASSES}
                    >
                      {t.back}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep2()) goToStep(3);
                      }}
                      className={SUBMIT_BUTTON_CLASSES}
                    >
                      {t.continueLabel}
                      <Icon name="arrow_forward" />
                    </button>
                  </div>
                </div>
              ) : null}

              {step === 3 ? (
                <div>
                  <p className="mb-6 font-mono text-xs uppercase tracking-widest text-primary">{t.step3Label}</p>
                  <div className="space-y-6">
                    <div>
                      <label
                        htmlFor="sim-floors"
                        className="mb-3 block font-mono text-[10px] uppercase tracking-widest text-primary"
                      >
                        {t.floors}
                      </label>
                      <select
                        id="sim-floors"
                        value={form.floors}
                        onChange={(e) => set("floors", e.target.value)}
                        className="w-full appearance-none border-b-2 border-outline-variant bg-surface-container-low px-4 py-4 text-on-surface outline-none focus:border-primary focus:ring-0"
                      >
                        <option value={t.floors1}>{t.floors1}</option>
                        <option value={t.floors2}>{t.floors2}</option>
                        <option value={t.floors3}>{t.floors3}</option>
                      </select>
                    </div>
                    <Field
                      id="sim-square-meters"
                      label={t.squareMeters}
                      type="number"
                      inputMode="numeric"
                      min={20}
                      max={2000}
                      step={5}
                      value={form.squareMeters}
                      onChange={(v) => set("squareMeters", v)}
                      error={errors.squareMeters}
                      hint={errors.squareMeters ? null : t.squareMetersHint}
                    />
                  </div>
                  {serverError ? <p className="mt-6 text-sm text-red-600">{serverError}</p> : null}
                  <div className={STEP_ACTIONS_ROW}>
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className={BACK_BUTTON_CLASSES}
                    >
                      {t.back}
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className={SUBMIT_BUTTON_CLASSES}
                    >
                      {t.submit}
                    </button>
                  </div>
                </div>
              ) : null}

              {/* Honeypot: invisível para pessoas, irresistível para bots. */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
                value={form.company}
                onChange={(e) => set("company", e.target.value)}
              />
            </>
          ) : null}

          {stage === "loading" ? (
            <div className="py-16 text-center">
              <div className="loader-spinner mx-auto mb-6" />
              <p className="mb-2 text-lg font-bold">{t.loadingTitle}</p>
              <p className="text-sm text-on-surface-variant">{t.loadingBody}</p>
            </div>
          ) : null}

          {stage === "result" ? (
            <div className="text-center">
              <Icon name="task_alt" className="mb-4 text-5xl text-primary" />
              <p className="mb-2 font-mono text-xs uppercase tracking-widest text-on-surface-variant">
                {t.resultEyebrow}
              </p>
              <p className="mb-3 font-heading text-headline-md font-bold">{t.resultHeading(squareMeters)}</p>
              <p className="mx-auto mb-10 max-w-xl text-sm leading-relaxed text-on-surface-variant">
                {t.resultBody}
              </p>

              <div className="grid gap-6 md:grid-cols-3 md:items-center">
                {tiers.map((tier) => (
                  <TierCard
                    key={tier.id}
                    tier={tier}
                    total={fmtEUR(squareMeters * tier.pricePerM2)}
                    pricePerM2={`${tier.pricePerM2.toLocaleString(localeTag(locale))} ${t.perM2}`}
                    plusVat={t.plusVat}
                    recommendedLabel={t.recommended}
                    whatsappLabel={t.whatsapp}
                    whatsappHref={whatsappHref(tier)}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={restart}
                className="mx-auto mt-8 inline-flex items-center justify-center gap-2 font-mono text-xs uppercase tracking-widest text-on-surface-variant transition-colors hover:text-primary"
              >
                <Icon name="refresh" className="text-sm" />
                {t.restart}
              </button>
              <p className="mt-6 font-mono text-[10px] text-on-surface-variant/70">{t.disclaimer}</p>
            </div>
          ) : null}
        </div>
      </div>
    </Reveal>
  );
}

/** Cartão de um escalão de preço. O destacado cresce e ganha a moldura laranja. */
function TierCard({
  tier,
  total,
  pricePerM2,
  plusVat,
  recommendedLabel,
  whatsappLabel,
  whatsappHref,
}: {
  tier: PriceTier;
  total: string;
  pricePerM2: string;
  plusVat: string;
  recommendedLabel: string;
  whatsappLabel: string;
  whatsappHref: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-2xl border p-8 text-center transition-all",
        tier.isHighlighted
          ? "border-primary bg-primary/5 shadow-[0_18px_50px_rgba(255,106,19,0.22)] md:-my-4 md:py-12"
          : "border-outline-variant bg-surface-container-lowest",
      )}
    >
      {tier.isHighlighted ? (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-on-primary">
          {recommendedLabel}
        </span>
      ) : null}

      {tier.iconName ? (
        <Icon
          name={tier.iconName}
          className={cn("mb-3 text-3xl", tier.isHighlighted ? "text-primary" : "text-on-surface-variant")}
        />
      ) : null}

      <h3 className="font-heading text-headline-md font-bold uppercase tracking-wide">{tier.label}</h3>
      {tier.description ? (
        <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{tier.description}</p>
      ) : null}

      <p className={cn("mt-6 font-heading text-3xl font-bold", tier.isHighlighted ? "text-primary" : "text-on-surface")}>
        {total}
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
        {plusVat} · {pricePerM2}
      </p>

      {tier.features.length > 0 ? (
        <ul className="mt-6 space-y-2 text-left">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-xs text-on-surface-variant">
              <Icon name="check" className="mt-0.5 text-sm text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      ) : null}

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "mt-8 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-bold uppercase tracking-wide transition-all hover:scale-105",
          tier.isHighlighted
            ? "bg-primary text-on-primary"
            : "border border-outline-variant text-on-surface hover:border-primary hover:text-primary",
        )}
      >
        {whatsappLabel}
        <Icon name="bolt" className="text-sm" />
      </a>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  type = "text",
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string | null;
  type?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "id" | "type" | "value" | "onChange">) {
  return (
    <div className="floating-label-container">
      <input
        id={id}
        type={type}
        value={value}
        placeholder={label}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={cn(FIELD_CLASSES, error && FIELD_ERROR_CLASSES)}
        {...rest}
      />
      <label htmlFor={id} className="font-mono text-sm uppercase">
        {label}
      </label>
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-2 text-xs text-on-surface-variant">{hint}</p>
      ) : null}
    </div>
  );
}

function ChoiceGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-3 font-bold">{label}</p>
      <div className="grid grid-cols-2 gap-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={value === option}
            className={cn(
              "rounded-xl border px-5 py-4 transition-colors",
              value === option
                ? "border-primary bg-primary text-white"
                : "border-outline-variant hover:border-primary",
            )}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Locale BCP-47 para formatação de números (separador de milhares). */
function localeTag(locale: SiteLocale): string {
  return { PT: "pt-PT", EN: "en-GB", ES: "es-ES", FR: "fr-FR" }[locale];
}
