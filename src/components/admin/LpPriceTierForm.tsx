"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, TextAreaField, CheckboxField, IconPickerField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import type { SiteLocale } from "@/lib/locale";

type Translation = {
  locale: SiteLocale;
  isAutoTranslated: boolean;
  label: string;
  description: string | null;
  features: string | null;
};

type LpPriceTier = {
  id: string;
  key: string;
  pricePerM2: number;
  order: number;
  isHighlighted: boolean;
  isActive: boolean;
  iconName: string | null;
  translations: Translation[];
};

type LpPriceTierFormProps = {
  tier?: LpPriceTier;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

const FEATURES_HINT = "Uma vantagem por linha — cada linha vira um item com visto no cartão.";

export function LpPriceTierForm({ tier, action }: LpPriceTierFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const pt = tier?.translations.find((t) => t.locale === "PT");
  const en = tier?.translations.find((t) => t.locale === "EN");
  const es = tier?.translations.find((t) => t.locale === "ES");
  const fr = tier?.translations.find((t) => t.locale === "FR");

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TextField
          id="key"
          name="key"
          label="Chave"
          defaultValue={tier?.key}
          required
          hint="Identificador interno, só minúsculas (ex: economica, conforto, premium)."
        />
        <TextField
          id="pricePerM2"
          name="pricePerM2"
          label="Preço por m² (€, sem IVA)"
          type="number"
          min={1}
          step={10}
          defaultValue={tier?.pricePerM2}
          required
          hint="A estimativa do cartão é este valor × os metros quadrados indicados pelo visitante."
        />
      </div>

      <IconPickerField id="iconName" name="iconName" label="Ícone do Cartão" defaultValue={tier?.iconName} />

      <LocaleTabs
        pt={
          <>
            <TextField id="labelPt" name="labelPt" label="Nome do Escalão (PT)" defaultValue={pt?.label} required />
            <TextAreaField
              id="descriptionPt"
              name="descriptionPt"
              label="Descrição Curta (PT)"
              rows={2}
              defaultValue={pt?.description ?? ""}
            />
            <TextAreaField
              id="featuresPt"
              name="featuresPt"
              label="O que Inclui (PT)"
              rows={5}
              defaultValue={pt?.features ?? ""}
              hint={FEATURES_HINT}
            />
          </>
        }
        en={
          <>
            <TextField id="labelEn" name="labelEn" label="Tier Name (EN)" defaultValue={en?.label} />
            <TextAreaField
              id="descriptionEn"
              name="descriptionEn"
              label="Short Description (EN)"
              rows={2}
              defaultValue={en?.description ?? ""}
            />
            <TextAreaField
              id="featuresEn"
              name="featuresEn"
              label="What's Included (EN)"
              rows={5}
              defaultValue={en?.features ?? ""}
            />
          </>
        }
        es={
          <>
            <TextField id="labelEs" name="labelEs" label="Nombre del Nivel (ES)" defaultValue={es?.label} />
            <TextAreaField
              id="descriptionEs"
              name="descriptionEs"
              label="Descripción Corta (ES)"
              rows={2}
              defaultValue={es?.description ?? ""}
            />
            <TextAreaField
              id="featuresEs"
              name="featuresEs"
              label="Qué Incluye (ES)"
              rows={5}
              defaultValue={es?.features ?? ""}
            />
          </>
        }
        fr={
          <>
            <TextField id="labelFr" name="labelFr" label="Nom du Niveau (FR)" defaultValue={fr?.label} />
            <TextAreaField
              id="descriptionFr"
              name="descriptionFr"
              label="Description Courte (FR)"
              rows={2}
              defaultValue={fr?.description ?? ""}
            />
            <TextAreaField
              id="featuresFr"
              name="featuresFr"
              label="Ce qui est Inclus (FR)"
              rows={5}
              defaultValue={fr?.features ?? ""}
            />
          </>
        }
        autoTranslated={{
          EN: en?.isAutoTranslated ?? true,
          ES: es?.isAutoTranslated ?? true,
          FR: fr?.isAutoTranslated ?? true,
        }}
      />

      <TextField
        id="order"
        name="order"
        label="Ordem de Exibição"
        type="number"
        defaultValue={tier?.order ?? 0}
        hint="Da esquerda para a direita no resultado do simulador."
      />

      <CheckboxField
        id="isHighlighted"
        name="isHighlighted"
        label="Cartão em destaque (opção recomendada)"
        defaultChecked={tier?.isHighlighted ?? false}
      />
      <p className="text-xs text-on-surface-variant">
        O cartão destacado aparece maior, com moldura laranja e o selo &quot;Recomendado&quot;. Normalmente é o
        escalão do meio.
      </p>

      <CheckboxField
        id="isActive"
        name="isActive"
        label="Ativo (visível no simulador)"
        defaultChecked={tier?.isActive ?? true}
      />

      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
