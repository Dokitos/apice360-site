"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, ImageField } from "@/components/admin/form-fields";

type ProjectImageFormProps = {
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function ProjectImageForm({ action }: ProjectImageFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <ImageField id="url" name="url" label="Imagem" />
      <TextField id="alt" name="alt" label="Texto Alternativo (acessibilidade)" />
      <TextField id="order" name="order" label="Ordem" type="number" defaultValue={0} />
      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A adicionar..." : "Adicionar Imagem"}
      </Button>
    </form>
  );
}
