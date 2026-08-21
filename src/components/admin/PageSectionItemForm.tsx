"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, TextAreaField, ImageField, IconPickerField, SelectField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import type { SiteLocale } from "@/lib/locale";

type PageSectionItem = {
  iconName: string | null;
  imageUrl: string | null;
  numberLabel: string | null;
  ctaKey: string | null;
  order: number;
  translations: { locale: SiteLocale; isAutoTranslated: boolean; title: string; body: string | null }[];
};

type CtaOption = { key: string; label: string };

type PageSectionItemFormProps = {
  item?: PageSectionItem;
  ctas?: CtaOption[];
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function PageSectionItemForm({ item, ctas = [], action }: PageSectionItemFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const pt = item?.translations.find((t) => t.locale === "PT");
  const en = item?.translations.find((t) => t.locale === "EN");
  const es = item?.translations.find((t) => t.locale === "ES");
  const fr = item?.translations.find((t) => t.locale === "FR");

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <IconPickerField id="iconName" name="iconName" label="Ícone (opcional)" defaultValue={item?.iconName} />
        <TextField id="numberLabel" name="numberLabel" label="Número (opcional)" defaultValue={item?.numberLabel ?? ""} placeholder="ex: 01" />
      </div>
      <ImageField id="imageUrl" name="imageUrl" label="Imagem (opcional)" defaultValue={item?.imageUrl} />
      <SelectField
        id="ctaKey"
        name="ctaKey"
        label="Botão associado (opcional)"
        defaultValue={item?.ctaKey ?? ""}
        hint="Mostra um botão neste item, usando um CTA já criado em CTAs."
      >
        <option value="">Nenhum</option>
        {ctas.map((c) => (
          <option key={c.key} value={c.key}>
            {c.label} ({c.key})
          </option>
        ))}
      </SelectField>
      <LocaleTabs
        pt={
          <>
            <TextField id="titlePt" name="titlePt" label="Título (PT)" defaultValue={pt?.title} required />
            <TextAreaField id="bodyPt" name="bodyPt" label="Texto (PT)" defaultValue={pt?.body ?? ""} />
          </>
        }
        en={
          <>
            <TextField id="titleEn" name="titleEn" label="Title (EN)" defaultValue={en?.title ?? ""} />
            <TextAreaField id="bodyEn" name="bodyEn" label="Body (EN)" defaultValue={en?.body ?? ""} />
          </>
        }
        es={
          <>
            <TextField id="titleEs" name="titleEs" label="Título (ES)" defaultValue={es?.title ?? ""} />
            <TextAreaField id="bodyEs" name="bodyEs" label="Texto (ES)" defaultValue={es?.body ?? ""} />
          </>
        }
        fr={
          <>
            <TextField id="titleFr" name="titleFr" label="Titre (FR)" defaultValue={fr?.title ?? ""} />
            <TextAreaField id="bodyFr" name="bodyFr" label="Texte (FR)" defaultValue={fr?.body ?? ""} />
          </>
        }
        autoTranslated={{
          EN: en?.isAutoTranslated ?? true,
          ES: es?.isAutoTranslated ?? true,
          FR: fr?.isAutoTranslated ?? true,
        }}
      />
      <TextField id="order" name="order" label="Ordem" type="number" defaultValue={item?.order ?? 0} />
      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
