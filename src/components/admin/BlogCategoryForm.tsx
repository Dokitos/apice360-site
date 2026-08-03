"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";

type BlogCategory = {
  order: number;
  translations: { locale: "PT" | "EN"; name: string; slug: string }[];
};

type BlogCategoryFormProps = {
  category?: BlogCategory;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function BlogCategoryForm({ category, action }: BlogCategoryFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const pt = category?.translations.find((t) => t.locale === "PT");
  const en = category?.translations.find((t) => t.locale === "EN");

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <LocaleTabs
        pt={
          <>
            <TextField id="namePt" name="namePt" label="Nome (PT)" defaultValue={pt?.name} required />
            <TextField id="slugPt" name="slugPt" label="Slug (PT)" defaultValue={pt?.slug} required />
          </>
        }
        en={
          <>
            <TextField id="nameEn" name="nameEn" label="Name (EN)" defaultValue={en?.name} required />
            <TextField id="slugEn" name="slugEn" label="Slug (EN)" defaultValue={en?.slug} required />
          </>
        }
      />
      <TextField id="order" name="order" label="Ordem" type="number" defaultValue={category?.order ?? 0} />
      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
