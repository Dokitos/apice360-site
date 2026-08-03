"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, SelectField, CheckboxField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";

type Cta = {
  id: string;
  key: string;
  url: string;
  style: string | null;
  iconName: string | null;
  isActive: boolean;
  translations: { locale: "PT" | "EN"; label: string }[];
};

type CtaFormProps = {
  cta?: Cta;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function CtaForm({ cta, action }: CtaFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const pt = cta?.translations.find((t) => t.locale === "PT");
  const en = cta?.translations.find((t) => t.locale === "EN");

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <TextField
        id="key"
        name="key"
        label="Chave (identificador único)"
        defaultValue={cta?.key}
        placeholder="ex: home_hero"
        readOnly={Boolean(cta)}
        required
        hint={cta ? "A chave não pode ser alterada depois de criada." : "minúsculas, números e underscore."}
      />
      <TextField
        id="url"
        name="url"
        label="Destino (URL ou link do WhatsApp)"
        defaultValue={cta?.url}
        placeholder="https://wa.me/351000000000"
        required
      />
      <LocaleTabs
        pt={<TextField id="labelPt" name="labelPt" label="Texto do Botão (PT)" defaultValue={pt?.label} required />}
        en={<TextField id="labelEn" name="labelEn" label="Texto do Botão (EN)" defaultValue={en?.label} required />}
      />
      <TextField
        id="iconName"
        name="iconName"
        label="Ícone (Material Symbols, opcional)"
        defaultValue={cta?.iconName ?? ""}
        placeholder="ex: bolt"
      />
      <SelectField id="style" name="style" label="Estilo" defaultValue={cta?.style ?? "primary"}>
        <option value="primary">Primário (preenchido)</option>
        <option value="outline">Contorno</option>
        <option value="ghost">Discreto</option>
      </SelectField>
      <CheckboxField id="isActive" name="isActive" label="Ativo (visível no site)" defaultChecked={cta?.isActive ?? true} />
      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
