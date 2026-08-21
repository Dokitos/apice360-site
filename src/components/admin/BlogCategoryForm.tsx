"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, SlugField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";
import type { SiteLocale } from "@/lib/locale";

type BlogCategory = {
  order: number;
  translations: { locale: SiteLocale; isAutoTranslated: boolean; name: string; slug: string }[];
};

type BlogCategoryFormProps = {
  category?: BlogCategory;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function BlogCategoryForm({ category, action }: BlogCategoryFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const pt = category?.translations.find((t) => t.locale === "PT");
  const en = category?.translations.find((t) => t.locale === "EN");
  const es = category?.translations.find((t) => t.locale === "ES");
  const fr = category?.translations.find((t) => t.locale === "FR");

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <LocaleTabs
        pt={
          <>
            <TextField id="namePt" name="namePt" label="Nome (PT)" defaultValue={pt?.name} required />
            <SlugField id="slugPt" name="slugPt" label="Slug (PT)" defaultValue={pt?.slug} sourceId="namePt" required />
          </>
        }
        en={
          <>
            <TextField id="nameEn" name="nameEn" label="Name (EN)" defaultValue={en?.name} />
            <SlugField id="slugEn" name="slugEn" label="Slug (EN)" defaultValue={en?.slug} sourceId="nameEn" />
          </>
        }
        es={
          <>
            <TextField id="nameEs" name="nameEs" label="Nombre (ES)" defaultValue={es?.name} />
            <SlugField id="slugEs" name="slugEs" label="Slug (ES)" defaultValue={es?.slug} sourceId="nameEs" />
          </>
        }
        fr={
          <>
            <TextField id="nameFr" name="nameFr" label="Nom (FR)" defaultValue={fr?.name} />
            <SlugField id="slugFr" name="slugFr" label="Slug (FR)" defaultValue={fr?.slug} sourceId="nameFr" />
          </>
        }
        autoTranslated={{
          EN: en?.isAutoTranslated ?? true,
          ES: es?.isAutoTranslated ?? true,
          FR: fr?.isAutoTranslated ?? true,
        }}
      />
      <TextField id="order" name="order" label="Ordem" type="number" defaultValue={category?.order ?? 0} />
      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
