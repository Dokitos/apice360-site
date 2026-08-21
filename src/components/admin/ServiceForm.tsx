"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, CheckboxField } from "@/components/admin/form-fields";
import { ImageField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import type { SiteLocale } from "@/lib/locale";

type Service = {
  imageUrl: string | null;
  ctaKey: string | null;
  isActive: boolean;
  translations: { locale: SiteLocale; isAutoTranslated: boolean; cardLabel: string; title: string; intro: string }[];
};

type ServiceFormProps = {
  service?: Service;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function ServiceForm({ service, action }: ServiceFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const pt = service?.translations.find((t) => t.locale === "PT");
  const en = service?.translations.find((t) => t.locale === "EN");
  const es = service?.translations.find((t) => t.locale === "ES");
  const fr = service?.translations.find((t) => t.locale === "FR");

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <ImageField id="imageUrl" name="imageUrl" label="Imagem de Destaque" defaultValue={service?.imageUrl} />
      <TextField
        id="ctaKey"
        name="ctaKey"
        label="Chave do CTA associado (opcional)"
        defaultValue={service?.ctaKey ?? ""}
        placeholder="ex: services_lsf_advantages"
        hint="Ligação a um CTA criado no módulo CTAs."
      />
      <CheckboxField
        id="isActive"
        name="isActive"
        label="Ativo (visível no site)"
        defaultChecked={service?.isActive ?? true}
      />
      <LocaleTabs
        pt={
          <>
            <TextField id="cardLabelPt" name="cardLabelPt" label="Rótulo do Cartão (PT)" defaultValue={pt?.cardLabel} required />
            <TextField id="titlePt" name="titlePt" label="Título (PT)" defaultValue={pt?.title} required />
            <RichTextEditor id="introPt" name="introPt" label="Introdução (PT)" defaultValue={pt?.intro} />
          </>
        }
        en={
          <>
            <TextField id="cardLabelEn" name="cardLabelEn" label="Card Label (EN)" defaultValue={en?.cardLabel} />
            <TextField id="titleEn" name="titleEn" label="Title (EN)" defaultValue={en?.title} />
            <RichTextEditor id="introEn" name="introEn" label="Intro (EN)" defaultValue={en?.intro} />
          </>
        }
        es={
          <>
            <TextField id="cardLabelEs" name="cardLabelEs" label="Rótulo do Cartão (ES)" defaultValue={es?.cardLabel} />
            <TextField id="titleEs" name="titleEs" label="Título (ES)" defaultValue={es?.title} />
            <RichTextEditor id="introEs" name="introEs" label="Introducción (ES)" defaultValue={es?.intro} />
          </>
        }
        fr={
          <>
            <TextField id="cardLabelFr" name="cardLabelFr" label="Libellé de la Carte (FR)" defaultValue={fr?.cardLabel} />
            <TextField id="titleFr" name="titleFr" label="Titre (FR)" defaultValue={fr?.title} />
            <RichTextEditor id="introFr" name="introFr" label="Introduction (FR)" defaultValue={fr?.intro} />
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
