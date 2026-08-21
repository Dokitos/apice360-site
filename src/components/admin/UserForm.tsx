"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField, SelectField, CheckboxField } from "@/components/admin/form-fields";

type User = {
  name: string;
  email: string;
  role: "ADMIN" | "EDITOR";
  groupId: string | null;
  isActive: boolean;
};

type GroupOption = { id: string; name: string };

type UserFormProps = {
  user?: User;
  groups?: GroupOption[];
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

export function UserForm({ user, groups = [], action }: UserFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-xl space-y-6">
      <TextField id="name" name="name" label="Nome" defaultValue={user?.name} required />
      <TextField id="email" name="email" label="Email" type="email" defaultValue={user?.email} required />
      <TextField
        id="password"
        name="password"
        label={user ? "Nova Palavra-passe (opcional)" : "Palavra-passe"}
        type="password"
        required={!user}
        hint={user ? "Deixa em branco para manter a palavra-passe atual." : "Mínimo 8 caracteres."}
      />
      <SelectField id="role" name="role" label="Papel" defaultValue={user?.role ?? "EDITOR"}>
        <option value="EDITOR">Editor</option>
        <option value="ADMIN">Administrador</option>
      </SelectField>
      <SelectField
        id="groupId"
        name="groupId"
        label="Grupo de Permissões"
        defaultValue={user?.groupId ?? ""}
        hint="Só se aplica a Editores — Administradores têm sempre acesso total. Sem grupo, um Editor também mantém acesso total."
      >
        <option value="">Acesso total (padrão)</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </SelectField>
      <CheckboxField id="isActive" name="isActive" label="Conta ativa" defaultChecked={user?.isActive ?? true} />
      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
