"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, TextAreaField, CheckboxField, SelectField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { LP_FIELD_TYPES, LP_FIELD_TYPE_LABELS, hasOptions, type LpFieldTypeValue } from "@/lib/lp-simulator";
import type { SiteLocale } from "@/lib/locale";

type Translation = {
  locale: SiteLocale;
  isAutoTranslated: boolean;
  label: string;
  hint: string | null;
  options: string | null;
};

type SimulatorFieldRow = {
  id: string;
  key: string;
  type: string;
  step: number;
  order: number;
  isRequired: boolean;
  isActive: boolean;
  isHalfWidth: boolean;
  isSystem: boolean;
  translations: Translation[];
};

type Props = {
  field?: SimulatorFieldRow;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

const OPTIONS_HINT = "Uma opção por linha. É o texto que o visitante vê e o que fica gravado na lead.";

export function LpSimulatorFieldForm({ field, action }: Props) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const [type, setType] = useState<LpFieldTypeValue>((field?.type as LpFieldTypeValue) ?? "TEXT");
  const comOpcoes = hasOptions(type);
  const sistema = field?.isSystem ?? false;

  const pt = field?.translations.find((t) => t.locale === "PT");
  const en = field?.translations.find((t) => t.locale === "EN");
  const es = field?.translations.find((t) => t.locale === "ES");
  const fr = field?.translations.find((t) => t.locale === "FR");

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      {sistema ? (
        <p className="rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm text-on-surface">
          Este campo é necessário ao funcionamento do simulador: o nome, o e-mail e o telefone são o que torna
          a lead contactável, e os metros quadrados entram na conta da estimativa. Podes mudar a pergunta, a
          ajuda, o passo e a ordem — não podes apagá-lo nem desligá-lo.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TextField
          id="key"
          name="key"
          label="Chave"
          defaultValue={field?.key}
          readOnly={sistema}
          required
          hint={
            sistema
              ? "Fixa: é por esta chave que o simulador reconhece o campo."
              : "Identificador interno (ex: prazoDesejado). Aparece na lead junto à resposta."
          }
        />
        <SelectField
          id="type"
          name="type"
          label="Tipo de campo"
          value={type}
          onChange={(e) => setType(e.target.value as LpFieldTypeValue)}
          disabled={sistema}
          hint={sistema ? "Fixo neste campo." : "Como a pergunta é apresentada a quem preenche."}
        >
          {LP_FIELD_TYPES.map((t) => (
            <option key={t} value={t}>
              {LP_FIELD_TYPE_LABELS[t]}
            </option>
          ))}
        </SelectField>
        {/* Um <select> bloqueado não é enviado; o servidor repõe o tipo a
            partir da base de dados, e isto mantém o valor visível no form. */}
        {sistema ? <input type="hidden" name="type" value={type} /> : null}

        <SelectField
          id="step"
          name="step"
          label="Passo"
          defaultValue={String(field?.step ?? 1)}
          hint="O simulador tem três passos. Um passo sem campos deixa de aparecer."
        >
          <option value="1">1 — Os seus dados</option>
          <option value="2">2 — Sobre o terreno e o projeto</option>
          <option value="3">3 — Sobre a construção</option>
        </SelectField>
        <TextField
          id="order"
          name="order"
          label="Ordem dentro do passo"
          type="number"
          defaultValue={field?.order ?? 0}
          hint="Menor aparece primeiro."
        />
      </div>

      <div className="space-y-3">
        <CheckboxField
          id="isRequired"
          name="isRequired"
          label="Obrigatório (não deixa avançar sem resposta)"
          defaultChecked={field?.isRequired ?? false}
        />
        <CheckboxField
          id="isHalfWidth"
          name="isHalfWidth"
          label="Ocupa meia linha (para dois campos curtos ficarem lado a lado)"
          defaultChecked={field?.isHalfWidth ?? false}
        />
        <CheckboxField
          id="isActive"
          name="isActive"
          label="Ativo (aparece no formulário)"
          defaultChecked={field?.isActive ?? true}
          disabled={sistema}
        />
      </div>

      <LocaleTabs
        pt={
          <>
            <TextField id="labelPt" name="labelPt" label="Pergunta (PT)" defaultValue={pt?.label ?? ""} required />
            <TextField id="hintPt" name="hintPt" label="Ajuda por baixo (PT)" defaultValue={pt?.hint ?? ""} />
            {comOpcoes ? (
              <TextAreaField id="optionsPt" name="optionsPt" label="Opções (PT)" defaultValue={pt?.options ?? ""} hint={OPTIONS_HINT} />
            ) : null}
          </>
        }
        en={
          <>
            <TextField id="labelEn" name="labelEn" label="Question (EN)" defaultValue={en?.label ?? ""} />
            <TextField id="hintEn" name="hintEn" label="Helper text (EN)" defaultValue={en?.hint ?? ""} />
            {comOpcoes ? (
              <TextAreaField id="optionsEn" name="optionsEn" label="Options (EN)" defaultValue={en?.options ?? ""} hint={OPTIONS_HINT} />
            ) : null}
          </>
        }
        es={
          <>
            <TextField id="labelEs" name="labelEs" label="Pregunta (ES)" defaultValue={es?.label ?? ""} />
            <TextField id="hintEs" name="hintEs" label="Texto de ayuda (ES)" defaultValue={es?.hint ?? ""} />
            {comOpcoes ? (
              <TextAreaField id="optionsEs" name="optionsEs" label="Opciones (ES)" defaultValue={es?.options ?? ""} hint={OPTIONS_HINT} />
            ) : null}
          </>
        }
        fr={
          <>
            <TextField id="labelFr" name="labelFr" label="Question (FR)" defaultValue={fr?.label ?? ""} />
            <TextField id="hintFr" name="hintFr" label="Texte d'aide (FR)" defaultValue={fr?.hint ?? ""} />
            {comOpcoes ? (
              <TextAreaField id="optionsFr" name="optionsFr" label="Options (FR)" defaultValue={fr?.options ?? ""} hint={OPTIONS_HINT} />
            ) : null}
          </>
        }
        autoTranslated={{
          EN: en?.isAutoTranslated ?? true,
          ES: es?.isAutoTranslated ?? true,
          FR: fr?.isAutoTranslated ?? true,
        }}
      />

      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
