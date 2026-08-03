"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, TextAreaField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";

type ServiceFeature = {
  iconName: string | null;
  order: number;
  translations: { locale: "PT" | "EN"; title: string; body: string | null }[];
};

type ServiceFeatureFormProps = {
  feature?: ServiceFeature;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function ServiceFeatureForm({ feature, action }: ServiceFeatureFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const pt = feature?.translations.find((t) => t.locale === "PT");
  const en = feature?.translations.find((t) => t.locale === "EN");

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <TextField
        id="iconName"
        name="iconName"
        label="Ícone (Material Symbols)"
        defaultValue={feature?.iconName ?? ""}
        placeholder="ex: timer"
      />
      <LocaleTabs
        pt={
          <>
            <TextField id="titlePt" name="titlePt" label="Título (PT)" defaultValue={pt?.title} required />
            <TextAreaField id="bodyPt" name="bodyPt" label="Texto (PT)" defaultValue={pt?.body ?? ""} />
          </>
        }
        en={
          <>
            <TextField id="titleEn" name="titleEn" label="Title (EN)" defaultValue={en?.title} required />
            <TextAreaField id="bodyEn" name="bodyEn" label="Body (EN)" defaultValue={en?.body ?? ""} />
          </>
        }
      />
      <TextField id="order" name="order" label="Ordem" type="number" defaultValue={feature?.order ?? 0} />
      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
