"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, TextAreaField, CheckboxField, SelectField } from "@/components/admin/form-fields";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

type Template = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  locale: string;
  subject: string;
  bodyHtml: string;
  isActive: boolean;
};

export function EmailTemplateForm({
  template,
  action,
}: {
  template?: Template;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
}) {
  const [error, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TextField
          id="name"
          name="name"
          label="Nome"
          defaultValue={template?.name}
          required
          hint="Como aparece na lista ao escrever (ex: Proposta enviada)."
        />
        <TextField
          id="key"
          name="key"
          label="Chave"
          defaultValue={template?.key}
          required
          hint="Identificador interno, minúsculas e underscore."
        />
      </div>

      <TextAreaField
        id="description"
        name="description"
        label="Quando usar (opcional)"
        rows={2}
        defaultValue={template?.description ?? ""}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <SelectField id="locale" name="locale" label="Idioma" defaultValue={template?.locale ?? "PT"}>
          <option value="PT">Português</option>
          <option value="EN">Inglês</option>
          <option value="ES">Espanhol</option>
          <option value="FR">Francês</option>
        </SelectField>
        <TextField id="subject" name="subject" label="Assunto" defaultValue={template?.subject} required />
      </div>

      <RichTextEditor
        id="bodyHtml"
        name="bodyHtml"
        label="Corpo da mensagem"
        defaultValue={template?.bodyHtml ?? ""}
      />

      <CheckboxField
        id="isActive"
        name="isActive"
        label="Ativo (aparece na lista ao escrever)"
        defaultChecked={template?.isActive ?? true}
      />

      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
