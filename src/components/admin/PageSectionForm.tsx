"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, TextAreaField, CheckboxField, ImageField, IconPickerField, SelectField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { SiteLocale } from "@/lib/locale";

type PageSection = {
  key: string;
  layout: string;
  imageUrl: string | null;
  iconName: string | null;
  ctaKey: string | null;
  order: number;
  isActive: boolean;
  translations: {
    locale: SiteLocale;
    isAutoTranslated: boolean;
    eyebrow: string | null;
    heading: string | null;
    subheading: string | null;
    body: string | null;
    ctaLabel: string | null;
  }[];
};

type CtaOption = { key: string; label: string };

type PageSectionFormProps = {
  section?: PageSection;
  ctas?: CtaOption[];
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function PageSectionForm({ section, ctas = [], action }: PageSectionFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const pt = section?.translations.find((t) => t.locale === "PT");
  const en = section?.translations.find((t) => t.locale === "EN");
  const es = section?.translations.find((t) => t.locale === "ES");
  const fr = section?.translations.find((t) => t.locale === "FR");

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
      <SelectField
        id="layout"
        name="layout"
        label="Layout"
        defaultValue={section?.layout ?? "standard"}
        hint="Como os itens desta secção são apresentados no site."
      >
        <option value="standard">Padrão (texto centrado + grelha de itens)</option>
        <option value="grid">Grelha de cartões</option>
        <option value="timeline">Linha do tempo</option>
      </SelectField>
      <ImageField id="imageUrl" name="imageUrl" label="Imagem (opcional)" defaultValue={section?.imageUrl} />
      <IconPickerField id="iconName" name="iconName" label="Ícone (opcional)" defaultValue={section?.iconName} />
      <SelectField
        id="ctaKey"
        name="ctaKey"
        label="Botão associado (opcional)"
        defaultValue={section?.ctaKey ?? ""}
        hint="Mostra um botão nesta secção, usando um CTA já criado em CTAs."
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
        es={
          <>
            <TextField id="eyebrowEs" name="eyebrowEs" label="Texto de Destaque (ES)" defaultValue={es?.eyebrow ?? ""} />
            <TextField id="headingEs" name="headingEs" label="Título (ES)" defaultValue={es?.heading ?? ""} />
            <TextAreaField id="subheadingEs" name="subheadingEs" label="Subtítulo (ES)" defaultValue={es?.subheading ?? ""} />
            <RichTextEditor id="bodyEs" name="bodyEs" label="Texto (ES)" defaultValue={es?.body ?? ""} />
            <TextField id="ctaLabelEs" name="ctaLabelEs" label="Texto do CTA (ES)" defaultValue={es?.ctaLabel ?? ""} />
          </>
        }
        fr={
          <>
            <TextField id="eyebrowFr" name="eyebrowFr" label="Texte de Mise en Avant (FR)" defaultValue={fr?.eyebrow ?? ""} />
            <TextField id="headingFr" name="headingFr" label="Titre (FR)" defaultValue={fr?.heading ?? ""} />
            <TextAreaField id="subheadingFr" name="subheadingFr" label="Sous-titre (FR)" defaultValue={fr?.subheading ?? ""} />
            <RichTextEditor id="bodyFr" name="bodyFr" label="Texte (FR)" defaultValue={fr?.body ?? ""} />
            <TextField id="ctaLabelFr" name="ctaLabelFr" label="Texte du CTA (FR)" defaultValue={fr?.ctaLabel ?? ""} />
          </>
        }
        autoTranslated={{
          EN: en?.isAutoTranslated ?? true,
          ES: es?.isAutoTranslated ?? true,
          FR: fr?.isAutoTranslated ?? true,
        }}
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
