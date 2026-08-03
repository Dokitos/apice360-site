"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, TextAreaField, ImageField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";

type PageSeo = {
  ogImageUrl: string | null;
  translations: { locale: "PT" | "EN"; title: string; description: string }[];
};

type PageSeoFormProps = {
  seo?: PageSeo;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function PageSeoForm({ seo, action }: PageSeoFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const pt = seo?.translations.find((t) => t.locale === "PT");
  const en = seo?.translations.find((t) => t.locale === "EN");

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <ImageField id="ogImageUrl" name="ogImageUrl" label="Imagem de Partilha (Open Graph)" defaultValue={seo?.ogImageUrl} />
      <LocaleTabs
        pt={
          <>
            <TextField id="titlePt" name="titlePt" label="Título SEO (PT)" defaultValue={pt?.title} required />
            <TextAreaField id="descriptionPt" name="descriptionPt" label="Descrição SEO (PT)" defaultValue={pt?.description} required />
          </>
        }
        en={
          <>
            <TextField id="titleEn" name="titleEn" label="SEO Title (EN)" defaultValue={en?.title} required />
            <TextAreaField id="descriptionEn" name="descriptionEn" label="SEO Description (EN)" defaultValue={en?.description} required />
          </>
        }
      />
      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
