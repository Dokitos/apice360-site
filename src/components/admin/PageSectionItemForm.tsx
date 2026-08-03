"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, TextAreaField, ImageField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";

type PageSectionItem = {
  iconName: string | null;
  imageUrl: string | null;
  numberLabel: string | null;
  order: number;
  translations: { locale: "PT" | "EN"; title: string; body: string | null }[];
};

type PageSectionItemFormProps = {
  item?: PageSectionItem;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function PageSectionItemForm({ item, action }: PageSectionItemFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const pt = item?.translations.find((t) => t.locale === "PT");
  const en = item?.translations.find((t) => t.locale === "EN");

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TextField id="iconName" name="iconName" label="Ícone (opcional)" defaultValue={item?.iconName ?? ""} placeholder="ex: chat_bubble" />
        <TextField id="numberLabel" name="numberLabel" label="Número (opcional)" defaultValue={item?.numberLabel ?? ""} placeholder="ex: 01" />
      </div>
      <ImageField id="imageUrl" name="imageUrl" label="Imagem (opcional)" defaultValue={item?.imageUrl} />
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
      <TextField id="order" name="order" label="Ordem" type="number" defaultValue={item?.order ?? 0} />
      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
