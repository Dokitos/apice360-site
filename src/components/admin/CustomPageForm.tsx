"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, CheckboxField, SlugField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import type { SiteLocale } from "@/lib/locale";

type CustomPage = {
  slug: string;
  order: number;
  showInMenu: boolean;
  isPublished: boolean;
  translations: {
    locale: SiteLocale;
    isAutoTranslated: boolean;
    navLabel: string;
    heading: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
  }[];
};

type CustomPageFormProps = {
  page?: CustomPage;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function CustomPageForm({ page, action }: CustomPageFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const pt = page?.translations.find((t) => t.locale === "PT");
  const en = page?.translations.find((t) => t.locale === "EN");
  const es = page?.translations.find((t) => t.locale === "ES");
  const fr = page?.translations.find((t) => t.locale === "FR");

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <SlugField
        id="slug"
        name="slug"
        label="Slug (URL)"
        defaultValue={page?.slug}
        placeholder="ex: sobre-o-lsf"
        sourceId="navLabelPt"
        readOnly={Boolean(page)}
        required
        hint={
          page
            ? "O slug não pode ser alterado depois de criado."
            : `Fica acessível em /paginas/<slug>. Gerado automaticamente a partir do texto do menu.`
        }
      />

      <LocaleTabs
        pt={
          <>
            <TextField id="navLabelPt" name="navLabelPt" label="Texto no Menu (PT)" defaultValue={pt?.navLabel} required />
            <TextField id="headingPt" name="headingPt" label="Título da Página (PT, opcional)" defaultValue={pt?.heading ?? ""} />
            <TextField id="seoTitlePt" name="seoTitlePt" label="Título SEO (PT, opcional)" defaultValue={pt?.seoTitle ?? ""} />
            <TextField
              id="seoDescriptionPt"
              name="seoDescriptionPt"
              label="Descrição SEO (PT, opcional)"
              defaultValue={pt?.seoDescription ?? ""}
            />
          </>
        }
        en={
          <>
            <TextField id="navLabelEn" name="navLabelEn" label="Menu Text (EN)" defaultValue={en?.navLabel} />
            <TextField id="headingEn" name="headingEn" label="Page Title (EN)" defaultValue={en?.heading ?? ""} />
            <TextField id="seoTitleEn" name="seoTitleEn" label="SEO Title (EN)" defaultValue={en?.seoTitle ?? ""} />
            <TextField
              id="seoDescriptionEn"
              name="seoDescriptionEn"
              label="SEO Description (EN)"
              defaultValue={en?.seoDescription ?? ""}
            />
          </>
        }
        es={
          <>
            <TextField id="navLabelEs" name="navLabelEs" label="Texto del Menú (ES)" defaultValue={es?.navLabel} />
            <TextField id="headingEs" name="headingEs" label="Título de la Página (ES)" defaultValue={es?.heading ?? ""} />
            <TextField id="seoTitleEs" name="seoTitleEs" label="Título SEO (ES)" defaultValue={es?.seoTitle ?? ""} />
            <TextField
              id="seoDescriptionEs"
              name="seoDescriptionEs"
              label="Descripción SEO (ES)"
              defaultValue={es?.seoDescription ?? ""}
            />
          </>
        }
        fr={
          <>
            <TextField id="navLabelFr" name="navLabelFr" label="Texte du Menu (FR)" defaultValue={fr?.navLabel} />
            <TextField id="headingFr" name="headingFr" label="Titre de la Page (FR)" defaultValue={fr?.heading ?? ""} />
            <TextField id="seoTitleFr" name="seoTitleFr" label="Titre SEO (FR)" defaultValue={fr?.seoTitle ?? ""} />
            <TextField
              id="seoDescriptionFr"
              name="seoDescriptionFr"
              label="Description SEO (FR)"
              defaultValue={fr?.seoDescription ?? ""}
            />
          </>
        }
        autoTranslated={{
          EN: en?.isAutoTranslated ?? true,
          ES: es?.isAutoTranslated ?? true,
          FR: fr?.isAutoTranslated ?? true,
        }}
      />

      <TextField id="order" name="order" label="Ordem no Menu" type="number" defaultValue={page?.order ?? 0} />
      <div className="flex flex-col gap-3">
        <CheckboxField
          id="showInMenu"
          name="showInMenu"
          label="Mostrar no menu de navegação"
          defaultChecked={page?.showInMenu ?? true}
        />
        <CheckboxField
          id="isPublished"
          name="isPublished"
          label="Publicada (acessível em /paginas/...)"
          defaultChecked={page?.isPublished ?? true}
        />
      </div>

      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
