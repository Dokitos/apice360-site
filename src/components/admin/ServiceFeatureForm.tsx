"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, TextAreaField, IconPickerField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import type { SiteLocale } from "@/lib/locale";

type ServiceFeature = {
  iconName: string | null;
  order: number;
  translations: { locale: SiteLocale; isAutoTranslated: boolean; title: string; body: string | null }[];
};

type ServiceFeatureFormProps = {
  feature?: ServiceFeature;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function ServiceFeatureForm({ feature, action }: ServiceFeatureFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const pt = feature?.translations.find((t) => t.locale === "PT");
  const en = feature?.translations.find((t) => t.locale === "EN");
  const es = feature?.translations.find((t) => t.locale === "ES");
  const fr = feature?.translations.find((t) => t.locale === "FR");

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <IconPickerField id="iconName" name="iconName" label="Ícone" defaultValue={feature?.iconName} />
      <LocaleTabs
        pt={
          <>
            <TextField id="titlePt" name="titlePt" label="Título (PT)" defaultValue={pt?.title} required />
            <TextAreaField id="bodyPt" name="bodyPt" label="Texto (PT)" defaultValue={pt?.body ?? ""} />
          </>
        }
        en={
          <>
            <TextField id="titleEn" name="titleEn" label="Title (EN)" defaultValue={en?.title} />
            <TextAreaField id="bodyEn" name="bodyEn" label="Body (EN)" defaultValue={en?.body ?? ""} />
          </>
        }
        es={
          <>
            <TextField id="titleEs" name="titleEs" label="Título (ES)" defaultValue={es?.title} />
            <TextAreaField id="bodyEs" name="bodyEs" label="Texto (ES)" defaultValue={es?.body ?? ""} />
          </>
        }
        fr={
          <>
            <TextField id="titleFr" name="titleFr" label="Titre (FR)" defaultValue={fr?.title} />
            <TextAreaField id="bodyFr" name="bodyFr" label="Texte (FR)" defaultValue={fr?.body ?? ""} />
          </>
        }
        autoTranslated={{
          EN: en?.isAutoTranslated ?? true,
          ES: es?.isAutoTranslated ?? true,
          FR: fr?.isAutoTranslated ?? true,
        }}
      />
      <TextField id="order" name="order" label="Ordem" type="number" defaultValue={feature?.order ?? 0} />
      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
