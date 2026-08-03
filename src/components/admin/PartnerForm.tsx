"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, CheckboxField, ImageField } from "@/components/admin/form-fields";

type Partner = {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
  order: number;
  isActive: boolean;
};

type PartnerFormProps = {
  partner?: Partner;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function PartnerForm({ partner, action }: PartnerFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <TextField id="name" name="name" label="Nome do Parceiro" defaultValue={partner?.name} required />
      <ImageField id="logoUrl" name="logoUrl" label="Logo" defaultValue={partner?.logoUrl} />
      <TextField
        id="websiteUrl"
        name="websiteUrl"
        label="Website (opcional)"
        type="url"
        defaultValue={partner?.websiteUrl ?? ""}
        placeholder="https://..."
      />
      <TextField
        id="order"
        name="order"
        label="Ordem de Exibição"
        type="number"
        defaultValue={partner?.order ?? 0}
      />
      <CheckboxField
        id="isActive"
        name="isActive"
        label="Ativo (visível no site)"
        defaultChecked={partner?.isActive ?? true}
      />
      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
