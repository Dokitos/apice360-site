"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, CheckboxField } from "@/components/admin/form-fields";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

type Account = {
  id: string;
  address: string;
  displayName: string;
  signatureHtml: string | null;
  isDefault: boolean;
  isActive: boolean;
};

export function EmailAccountForm({
  account,
  action,
}: {
  account?: Account;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
}) {
  const [error, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <TextField
          id="address"
          name="address"
          label="Endereço"
          type="email"
          defaultValue={account?.address}
          required
          hint="O domínio tem de estar verificado no Resend para o envio passar."
        />
        <TextField
          id="displayName"
          name="displayName"
          label="Nome que aparece"
          defaultValue={account?.displayName}
          required
          hint="Ex: Ápice 360 — é o que o destinatário vê antes do endereço."
        />
      </div>

      <RichTextEditor
        id="signatureHtml"
        name="signatureHtml"
        label="Assinatura (opcional)"
        defaultValue={account?.signatureHtml ?? ""}
      />
      <p className="-mt-4 text-xs text-on-surface-variant">
        Acrescentada ao fim de cada mensagem escrita a partir deste endereço.
      </p>

      <div className="space-y-3">
        <CheckboxField
          id="isDefault"
          name="isDefault"
          label="Conta por omissão (fica escolhida ao escrever)"
          defaultChecked={account?.isDefault ?? false}
        />
        <CheckboxField
          id="isActive"
          name="isActive"
          label="Ativa (pode enviar e receber)"
          defaultChecked={account?.isActive ?? true}
        />
      </div>

      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
