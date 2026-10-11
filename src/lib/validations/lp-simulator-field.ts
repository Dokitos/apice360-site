import { z } from "zod";
import { LP_FIELD_TYPES } from "@/lib/lp-simulator";

const optionalText = z.string().trim().optional().or(z.literal(""));

/**
 * "company" é o campo-armadilha do formulário (honeypot): um campo com essa
 * chave passaria a ser preenchido por pessoas e o servidor descartava todas
 * as submissões como se fossem de robôs.
 */
export const RESERVED_FIELD_KEYS = ["company"];

export const lpSimulatorFieldSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Indica a chave do campo.")
    .max(40, "A chave é demasiado comprida.")
    .regex(
      /^[a-z][a-zA-Z0-9]*$/,
      "Começa por uma letra minúscula e usa só letras e números (ex: prazoDesejado).",
    ),
  type: z.enum(LP_FIELD_TYPES),
  step: z.coerce.number().int().min(1, "O passo vai de 1 a 3.").max(3, "O passo vai de 1 a 3."),
  order: z.coerce.number().int(),
  isRequired: z.boolean(),
  isActive: z.boolean(),
  isHalfWidth: z.boolean(),
  labelPt: z.string().trim().min(1, "Indica a pergunta em Português."),
  labelEn: optionalText,
  labelEs: optionalText,
  labelFr: optionalText,
  hintPt: optionalText,
  hintEn: optionalText,
  hintEs: optionalText,
  hintFr: optionalText,
  optionsPt: optionalText,
  optionsEn: optionalText,
  optionsEs: optionalText,
  optionsFr: optionalText,
});
