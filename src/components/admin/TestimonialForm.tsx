"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, TextAreaField, CheckboxField, ImageField } from "@/components/admin/form-fields";
import { LocaleTabs } from "@/components/admin/LocaleTabs";

type Testimonial = {
  id: string;
  authorName: string;
  location: string | null;
  avatarUrl: string | null;
  rating: number | null;
  order: number;
  showOnHome: boolean;
  isActive: boolean;
  translations: { locale: "PT" | "EN"; quote: string }[];
};

type TestimonialFormProps = {
  testimonial?: Testimonial;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function TestimonialForm({ testimonial, action }: TestimonialFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);
  const pt = testimonial?.translations.find((t) => t.locale === "PT");
  const en = testimonial?.translations.find((t) => t.locale === "EN");

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <TextField id="authorName" name="authorName" label="Nome do Cliente" defaultValue={testimonial?.authorName} required />
      <TextField
        id="location"
        name="location"
        label="Cargo / Localização"
        defaultValue={testimonial?.location ?? ""}
        placeholder="ex: Proprietário Residencial · Lisboa"
      />
      <ImageField id="avatarUrl" name="avatarUrl" label="Avatar (opcional)" defaultValue={testimonial?.avatarUrl} />
      <LocaleTabs
        pt={<TextAreaField id="quotePt" name="quotePt" label="Depoimento (PT)" defaultValue={pt?.quote} required />}
        en={<TextAreaField id="quoteEn" name="quoteEn" label="Depoimento (EN)" defaultValue={en?.quote} required />}
      />
      <TextField
        id="rating"
        name="rating"
        label="Classificação (1 a 5)"
        type="number"
        min={1}
        max={5}
        defaultValue={testimonial?.rating ?? 5}
      />
      <TextField
        id="order"
        name="order"
        label="Ordem de Exibição"
        type="number"
        defaultValue={testimonial?.order ?? 0}
      />
      <div className="flex flex-col gap-3">
        <CheckboxField
          id="showOnHome"
          name="showOnHome"
          label="Mostrar na Home"
          defaultChecked={testimonial?.showOnHome ?? true}
        />
        <CheckboxField
          id="isActive"
          name="isActive"
          label="Ativo (visível no site)"
          defaultChecked={testimonial?.isActive ?? true}
        />
      </div>
      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
