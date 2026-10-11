"use client";

import { useMemo, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { createSimulatorLead } from "@/app/(public)/actions/leads";
import { checkEmail, checkPhone } from "@/lib/validations/contactable";
import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";
import {
  hasOptions,
  MIN_SQUARE_METERS,
  MAX_SQUARE_METERS,
  type SimulatorField,
} from "@/lib/lp-simulator";

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
  /** As perguntas, pela ordem do painel — ver src/lib/lp-simulator.ts. */
  fields: SimulatorField[];
  whatsappNumber: string;
};

type Stage = "form" | "loading" | "result";

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

export function LpSimulator({ locale, heading, subheading, tiers, fields, whatsappNumber }: LpSimulatorProps) {
  const dict = getDictionary(locale);
  const t = dict.lp.simulator;

  // Os passos saem dos próprios campos: um passo sem campos ativos deixa de
  // existir, em vez de mostrar um ecrã vazio com um "Continuar".
  const steps = useMemo(() => {
    const usados = [...new Set(fields.map((f) => f.step))].sort((a, b) => a - b);
    return usados.length > 0 ? usados : [1];
  }, [fields]);

  const [stepIndex, setStepIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("form");
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [emailHint, setEmailHint] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const wizardRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<Record<string, string>>(() => valoresIniciais(fields));
  // Honeypot: fica sempre vazio para pessoas; se vier preenchido, o servidor
  // finge sucesso e não grava nada.
  const [company, setCompany] = useState("");

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  }

  const fmtEUR = useMemo(
    () => (value: number) => `${value.toLocaleString(localeTag(locale), { maximumFractionDigits: 0 })} €`,
    [locale],
  );

  const camposDoPasso = (step: number) => fields.filter((f) => f.step === step);
  const squareMetersField = fields.find((f) => f.key === "squareMeters");
  const squareMeters = Number.parseInt(form.squareMeters ?? "", 10) || 0;

  /**
   * Verifica um passo antes de deixar avançar. Os campos do sistema mantêm as
   * verificações próprias (email que existe mesmo, telefone completo, área
   * mínima); os restantes valem pelo que o painel disser — obrigatório ou não.
   */
  function validateStep(step: number): boolean {
    const next: Record<string, string | undefined> = {};
    setEmailHint(null);

    for (const field of camposDoPasso(step)) {
      const valor = (form[field.key] ?? "").trim();

      if (field.key === "name") {
        if (valor.length < 2) next.name = t.requiredName;
        continue;
      }

      if (field.key === "email") {
        const email = checkEmail(valor);
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
        continue;
      }

      if (field.key === "phone") {
        const phone = checkPhone(valor);
        if (!phone.ok) next.phone = phone.reason === "empty" ? t.requiredPhone : t.invalidPhone;
        continue;
      }

      if (field.key === "squareMeters") {
        const metros = Number.parseInt(valor, 10) || 0;
        if (metros < MIN_SQUARE_METERS || metros > MAX_SQUARE_METERS) next.squareMeters = t.squareMetersHint;
        continue;
      }

      if (field.isRequired && !valor) {
        next[field.key] = hasOptions(field.type) ? t.requiredChoice : t.requiredLocation;
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function goToStepIndex(n: number) {
    setStepIndex(n);
    setServerError(null);
    wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit() {
    if (!validateStep(steps[stepIndex])) return;

    setServerError(null);
    setStage("loading");

    const data = new FormData();
    for (const field of fields) data.set(field.key, form[field.key] ?? "");
    data.set("company", company);

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
        setErrors({ [result.field]: result.message });
        const falhado = fields.find((f) => f.key === result.field);
        if (falhado) setStepIndex(Math.max(0, steps.indexOf(falhado.step)));
      }
      return;
    }

    setStage("result");
  }

  function restart() {
    setStage("form");
    setStepIndex(0);
    setErrors({});
    setServerError(null);
    wizardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function whatsappHref(tier: PriceTier) {
    const message = [
      t.waIntro,
      ...fields.map((field) => `${field.label}: ${form[field.key] || "—"}`),
      `${tier.label}: ${fmtEUR(squareMeters * tier.pricePerM2)} ${t.plusVat}`,
    ].join("\n");
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  const stepAtual = steps[stepIndex];
  const ultimoPasso = stepIndex === steps.length - 1;

  return (
    <Reveal
      as="section"
      id="simulador"
      className="relative z-20 border-t border-outline-variant/10 bg-surface-container-lowest pb-24 pt-16 md:pb-32 md:pt-24"
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
                {steps.map((n, i) => (
                  <div
                    key={n}
                    className={cn(
                      "h-1.5 flex-1 rounded-full transition-colors",
                      i <= stepIndex ? "bg-primary" : "bg-outline-variant",
                    )}
                  />
                ))}
              </div>

              <p className="mb-6 font-mono text-xs uppercase tracking-widest text-primary">
                {stepLabel(t, stepIndex, steps.length)}
              </p>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {camposDoPasso(stepAtual).map((field) => (
                  <div key={field.key} className={field.isHalfWidth ? "sm:col-span-1" : "sm:col-span-2"}>
                    <SimulatorFieldInput
                      field={field}
                      value={form[field.key] ?? ""}
                      onChange={(v) => set(field.key, v)}
                      error={errors[field.key]}
                      hint={field.key === "email" ? emailHint : null}
                    />
                  </div>
                ))}
              </div>

              {serverError ? <p className="mt-6 text-sm text-red-600">{serverError}</p> : null}

              <div className={stepIndex === 0 ? "mt-10 flex" : STEP_ACTIONS_ROW}>
                {stepIndex > 0 ? (
                  <button type="button" onClick={() => goToStepIndex(stepIndex - 1)} className={BACK_BUTTON_CLASSES}>
                    {t.back}
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    if (ultimoPasso) {
                      void handleSubmit();
                    } else if (validateStep(stepAtual)) {
                      goToStepIndex(stepIndex + 1);
                    }
                  }}
                  className={SUBMIT_BUTTON_CLASSES}
                >
                  {ultimoPasso ? t.submit : t.continueLabel}
                  {ultimoPasso ? null : <Icon name="arrow_forward" />}
                </button>
              </div>

              {/* Honeypot: invisível para pessoas, irresistível para bots. */}
              <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                className="hidden"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
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
        {squareMetersField ? null : (
          // Sem o campo dos metros quadrados não há conta para fazer. O painel
          // não deixa apagá-lo; isto é só a rede por baixo.
          <p className="mt-4 text-center text-xs text-on-surface-variant">{t.disclaimer}</p>
        )}
      </div>
    </Reveal>
  );
}

/** O primeiro valor de uma lista fica escolhido à partida, como antes acontecia com os pisos. */
function valoresIniciais(fields: SimulatorField[]): Record<string, string> {
  const inicial: Record<string, string> = {};
  for (const field of fields) {
    inicial[field.key] = field.type === "SELECT" ? (field.options[0] ?? "") : "";
  }
  return inicial;
}

/**
 * Os rótulos dos três passos vêm dos dicionários e dizem "Passo 1 de 3". Se
 * um passo ficar sem campos, ou se houver menos passos do que rótulos, a
 * contagem é recalculada para não anunciar um passo que não existe.
 */
function stepLabel(
  t: ReturnType<typeof getDictionary>["lp"]["simulator"],
  index: number,
  total: number,
): string {
  const proprios = [t.step1Label, t.step2Label, t.step3Label];
  const rotulo = proprios[index];
  if (total === proprios.length && rotulo) return rotulo;

  // "Passo 1 de 3 · Os seus dados" → fica só a parte descritiva, com a
  // contagem certa à frente.
  const descricao = rotulo?.split("·").slice(1).join("·").trim();
  const contagem = `${t.step1Label.split(" ")[0]} ${index + 1}/${total}`;
  return descricao ? `${contagem} · ${descricao}` : contagem;
}

/** Desenha um campo conforme o tipo escolhido no painel. */
function SimulatorFieldInput({
  field,
  value,
  onChange,
  error,
  hint,
}: {
  field: SimulatorField;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string | null;
}) {
  const id = `sim-${field.key}`;
  const ajuda = error ? null : (hint ?? field.hint);

  if (field.type === "CHOICE") {
    return (
      <div>
        <p className="mb-3 font-bold">{field.label}</p>
        <div className="grid grid-cols-2 gap-3">
          {field.options.map((option) => (
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
        {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
        {ajuda ? <p className="mt-2 text-xs text-on-surface-variant">{ajuda}</p> : null}
      </div>
    );
  }

  if (field.type === "SELECT") {
    return (
      <div>
        <label htmlFor={id} className="mb-3 block font-mono text-[10px] uppercase tracking-widest text-primary">
          {field.label}
        </label>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none border-b-2 border-outline-variant bg-surface-container-low px-4 py-4 text-on-surface outline-none focus:border-primary focus:ring-0"
        >
          {field.isRequired ? null : <option value="">—</option>}
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
        {ajuda ? <p className="mt-2 text-xs text-on-surface-variant">{ajuda}</p> : null}
      </div>
    );
  }

  if (field.type === "TEXTAREA") {
    return (
      <div className="floating-label-container">
        <textarea
          id={id}
          rows={4}
          value={value}
          placeholder={field.label}
          aria-invalid={Boolean(error)}
          onChange={(e) => onChange(e.target.value)}
          className={cn(FIELD_CLASSES, "resize-y", error && FIELD_ERROR_CLASSES)}
        />
        <label htmlFor={id} className="font-mono text-sm uppercase">
          {field.label}
        </label>
        {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
        {ajuda ? <p className="mt-2 text-xs text-on-surface-variant">{ajuda}</p> : null}
      </div>
    );
  }

  const tipoHtml = field.type === "EMAIL" ? "email" : field.type === "TEL" ? "tel" : field.type === "NUMBER" ? "number" : "text";

  return (
    <Field
      id={id}
      label={field.label}
      type={tipoHtml}
      value={value}
      onChange={onChange}
      error={error}
      hint={ajuda}
      autoComplete={AUTOCOMPLETE[field.key]}
      {...(field.type === "NUMBER"
        ? { inputMode: "numeric" as const, min: MIN_SQUARE_METERS, max: MAX_SQUARE_METERS, step: 5 }
        : {})}
    />
  );
}

/** Ajuda o browser a preencher o que já conhece de quem visita. */
const AUTOCOMPLETE: Record<string, string | undefined> = {
  name: "name",
  email: "email",
  phone: "tel",
};

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
        "group relative flex h-full flex-col rounded-2xl border p-8 text-center transition-all duration-300",
        // O cartão levanta e ganha moldura laranja ao passar o rato — sinaliza
        // que é uma escolha, não apenas um valor a ler.
        "hover:-translate-y-2 hover:border-primary hover:shadow-[0_22px_55px_rgba(255,106,19,0.25)]",
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
          className={cn(
            "mb-3 text-3xl transition-all duration-300 group-hover:scale-110 group-hover:text-primary",
            tier.isHighlighted ? "text-primary" : "text-on-surface-variant",
          )}
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

      {/* A lista cresce para preencher o cartão: como os três níveis têm
          descrições de alturas diferentes, isto alinha os botões de WhatsApp
          na mesma linha nos três. */}
      {tier.features.length > 0 ? (
        <ul className="mt-6 flex-1 space-y-2 text-left">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-xs text-on-surface-variant">
              <Icon name="check" className="mt-0.5 text-sm text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex-1" />
      )}

      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          // whitespace-nowrap + tracking normal: o rótulo partia-se em duas
          // linhas dentro do cartão, como já tinha acontecido no botão de
          // calcular.
          "mt-8 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 py-3 text-[11px] font-bold uppercase transition-all hover:scale-105",
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

/** Locale BCP-47 para formatação de números (separador de milhares). */
function localeTag(locale: SiteLocale): string {
  return { PT: "pt-PT", EN: "en-GB", ES: "es-ES", FR: "fr-FR" }[locale];
}
