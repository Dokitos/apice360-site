"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, CheckboxField, IconPickerField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";

type Stat = {
  id: string;
  value: string;
  iconName: string | null;
  order: number;
  isActive: boolean;
  translations: { locale: "PT" | "EN"; label: string }[];
};

type StatFormProps = {
  stat?: Stat;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function StatForm({ stat, action }: StatFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const pt = stat?.translations.find((t) => t.locale === "PT");
  const en = stat?.translations.find((t) => t.locale === "EN");

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <TextField id="value" name="value" label="Valor (ex: 120+, 97%)" defaultValue={stat?.value} required />
      <IconPickerField id="iconName" name="iconName" label="Ícone" defaultValue={stat?.iconName} />
      <LocaleTabs
        pt={
          <TextField id="labelPt" name="labelPt" label="Rótulo (PT)" defaultValue={pt?.label} required />
        }
        en={
          <TextField id="labelEn" name="labelEn" label="Rótulo (EN)" defaultValue={en?.label} required />
        }
      />
      <TextField
        id="order"
        name="order"
        label="Ordem de Exibição"
        type="number"
        defaultValue={stat?.order ?? 0}
      />
      <CheckboxField
        id="isActive"
        name="isActive"
        label="Ativo (visível no site)"
        defaultChecked={stat?.isActive ?? true}
      />
      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
