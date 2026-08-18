"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, TextAreaField, CheckboxField, ImageField, IconPickerField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

type PageSection = {
  key: string;
  imageUrl: string | null;
  iconName: string | null;
  order: number;
  isActive: boolean;
  translations: {
    locale: "PT" | "EN";
    eyebrow: string | null;
    heading: string | null;
    subheading: string | null;
    body: string | null;
    ctaLabel: string | null;
  }[];
};

type PageSectionFormProps = {
  section?: PageSection;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function PageSectionForm({ section, action }: PageSectionFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const pt = section?.translations.find((t) => t.locale === "PT");
  const en = section?.translations.find((t) => t.locale === "EN");

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <TextField
        id="key"
        name="key"
        label="Chave da Secção"
        defaultValue={section?.key}
        placeholder="ex: why_choose"
        readOnly={Boolean(section)}
        required
        hint={section ? "A chave não pode ser alterada depois de criada." : "minúsculas, números e underscore."}
      />
      <ImageField id="imageUrl" name="imageUrl" label="Imagem (opcional)" defaultValue={section?.imageUrl} />
      <IconPickerField id="iconName" name="iconName" label="Ícone (opcional)" defaultValue={section?.iconName} />
      <LocaleTabs
        pt={
          <>
            <TextField
              id="eyebrowPt"
              name="eyebrowPt"
              label="Texto de Destaque (PT)"
              defaultValue={pt?.eyebrow ?? ""}
              hint="Pequena etiqueta acima do título, ex: 'Sobre Nós'. Deixa em branco para não mostrar."
            />
            <TextField id="headingPt" name="headingPt" label="Título (PT)" defaultValue={pt?.heading ?? ""} />
            <TextAreaField id="subheadingPt" name="subheadingPt" label="Subtítulo (PT)" defaultValue={pt?.subheading ?? ""} />
            <RichTextEditor id="bodyPt" name="bodyPt" label="Texto (PT)" defaultValue={pt?.body ?? ""} />
            <TextField id="ctaLabelPt" name="ctaLabelPt" label="Texto do CTA (PT)" defaultValue={pt?.ctaLabel ?? ""} />
          </>
        }
        en={
          <>
            <TextField
              id="eyebrowEn"
              name="eyebrowEn"
              label="Highlight Text (EN)"
              defaultValue={en?.eyebrow ?? ""}
              hint="Small label above the heading, e.g. 'About Us'. Leave blank to hide it."
            />
            <TextField id="headingEn" name="headingEn" label="Heading (EN)" defaultValue={en?.heading ?? ""} />
            <TextAreaField id="subheadingEn" name="subheadingEn" label="Subheading (EN)" defaultValue={en?.subheading ?? ""} />
            <RichTextEditor id="bodyEn" name="bodyEn" label="Body (EN)" defaultValue={en?.body ?? ""} />
            <TextField id="ctaLabelEn" name="ctaLabelEn" label="CTA Label (EN)" defaultValue={en?.ctaLabel ?? ""} />
          </>
        }
      />
      <TextField id="order" name="order" label="Ordem" type="number" defaultValue={section?.order ?? 0} />
      <CheckboxField id="isActive" name="isActive" label="Ativo (visível no site)" defaultChecked={section?.isActive ?? true} />
      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
