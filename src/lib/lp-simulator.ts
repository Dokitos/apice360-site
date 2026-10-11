import { getDictionary } from "@/lib/dictionary";
import type { SiteLocale } from "@/lib/locale";

/**
 * O formulário do simulador da landing page, descrito em dados.
 *
 * As perguntas estavam escritas no componente e nos dicionários: acrescentar
 * uma pergunta era mexer em código, e a resposta nova tinha de ser enfiada à
 * mão na mensagem da lead. Agora as perguntas vivem na tabela
 * LpSimulatorField e este ficheiro é o que o painel, a página e o servidor
 * partilham sobre elas.
 */

export const LP_FIELD_TYPES = ["TEXT", "EMAIL", "TEL", "NUMBER", "TEXTAREA", "SELECT", "CHOICE"] as const;
export type LpFieldTypeValue = (typeof LP_FIELD_TYPES)[number];

export const LP_FIELD_TYPE_LABELS: Record<LpFieldTypeValue, string> = {
  TEXT: "Texto curto",
  EMAIL: "E-mail",
  TEL: "Telefone",
  NUMBER: "Número",
  TEXTAREA: "Texto longo",
  SELECT: "Lista pendente",
  CHOICE: "Botões de escolha",
};

/** Tipos cujo valor sai de uma lista de opções. */
export function hasOptions(type: LpFieldTypeValue) {
  return type === "SELECT" || type === "CHOICE";
}

/**
 * Campos de que o simulador depende para funcionar: três identificam a lead
 * (e vão para as colunas próprias de nome, email e telefone) e os metros
 * quadrados entram na conta da estimativa. O painel deixa mudar o rótulo, a
 * ajuda, o passo e a ordem; apagar ou desligar, não — sem eles o formulário
 * deixava de produzir uma lead contactável ou uma estimativa.
 */
export const SYSTEM_FIELD_KEYS = ["name", "email", "phone", "squareMeters"] as const;
export type SystemFieldKey = (typeof SYSTEM_FIELD_KEYS)[number];

export function isSystemKey(key: string): key is SystemFieldKey {
  return (SYSTEM_FIELD_KEYS as readonly string[]).includes(key);
}

/** Área mínima aceite, abaixo da qual a estimativa não diz nada de útil. */
export const MIN_SQUARE_METERS = 20;
export const MAX_SQUARE_METERS = 2000;

export type SimulatorField = {
  id: string;
  key: string;
  type: LpFieldTypeValue;
  step: number;
  isRequired: boolean;
  isSystem: boolean;
  isHalfWidth: boolean;
  label: string;
  hint: string | null;
  options: string[];
};

/** Uma opção por linha, como nas features dos escalões de preço. */
export function splitOptions(raw: string | null | undefined): string[] {
  return (raw ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

/**
 * O formulário tal como sempre existiu, para quando a tabela ainda está
 * vazia: um site acabado de migrar continua a ter simulador, e o painel
 * mostra estes campos como ponto de partida depois de semeados.
 */
export function defaultSimulatorFields(locale: SiteLocale): SimulatorField[] {
  const t = getDictionary(locale).lp.simulator;

  const campo = (
    key: string,
    type: LpFieldTypeValue,
    step: number,
    extra: Partial<SimulatorField> = {},
  ): SimulatorField => ({
    id: `default-${key}`,
    key,
    type,
    step,
    isRequired: false,
    isSystem: isSystemKey(key),
    isHalfWidth: false,
    label: key,
    hint: null,
    options: [],
    ...extra,
  });

  return [
    campo("name", "TEXT", 1, { label: t.name, isRequired: true }),
    campo("email", "EMAIL", 1, { label: t.email, isRequired: true, isHalfWidth: true }),
    campo("phone", "TEL", 1, { label: t.phone, isRequired: true, isHalfWidth: true }),
    campo("hasLand", "CHOICE", 2, { label: t.hasLand, options: [t.yes, t.no] }),
    campo("hasProject", "CHOICE", 2, { label: t.hasProject, options: [t.yes, t.no] }),
    campo("buildLocation", "TEXT", 2, {
      label: t.buildLocation,
      hint: t.buildLocationHint,
      isRequired: true,
    }),
    campo("floors", "SELECT", 3, { label: t.floors, options: [t.floors1, t.floors2, t.floors3] }),
    campo("squareMeters", "NUMBER", 3, {
      label: t.squareMeters,
      hint: t.squareMetersHint,
      isRequired: true,
    }),
  ];
}
