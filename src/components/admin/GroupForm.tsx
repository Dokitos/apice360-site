"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/admin/form-fields";
import { RESOURCES, RESOURCE_LABELS, PERMISSION_ACTIONS, PERMISSION_ACTION_LABELS } from "@/lib/resources";

type GroupPermission = { resource: string; canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean };

type Group = {
  name: string;
  isSystem: boolean;
  permissions: GroupPermission[];
};

type GroupFormProps = {
  group?: Group;
  action: (prevState: string | undefined, formData: FormData) => Promise<string | undefined>;
};

const ACTION_FIELD: Record<(typeof PERMISSION_ACTIONS)[number], keyof GroupPermission> = {
  view: "canView",
  create: "canCreate",
  edit: "canEdit",
  delete: "canDelete",
};

export function GroupForm({ group, action }: GroupFormProps) {
  const [error, formAction, isPending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-3xl space-y-8">
      <TextField
        id="name"
        name="name"
        label="Nome do Grupo"
        defaultValue={group?.name}
        readOnly={group?.isSystem}
        required
        hint={group?.isSystem ? "Este é um grupo do sistema e o nome não pode ser alterado." : undefined}
      />

      <div>
        <h2 className="mb-4 font-heading text-headline-md">Permissões</h2>
        <p className="mb-4 text-sm text-on-surface-variant">
          Escolhe a que áreas do painel este grupo tem acesso e o que pode fazer em cada uma.
        </p>
        <div className="overflow-x-auto rounded-lg border border-outline-variant/20">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant/20 bg-surface-container-low">
                <th className="px-4 py-3 font-mono text-label-mono uppercase tracking-widest text-on-surface-variant">
                  Área
                </th>
                {PERMISSION_ACTIONS.map((action) => (
                  <th
                    key={action}
                    className="px-4 py-3 text-center font-mono text-label-mono uppercase tracking-widest text-on-surface-variant"
                  >
                    {PERMISSION_ACTION_LABELS[action]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RESOURCES.map((resource) => {
                const existing = group?.permissions.find((p) => p.resource === resource);
                return (
                  <tr key={resource} className="border-b border-outline-variant/10 last:border-0">
                    <td className="px-4 py-3 font-bold text-on-surface">{RESOURCE_LABELS[resource]}</td>
                    {PERMISSION_ACTIONS.map((permAction) => (
                      <td key={permAction} className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          name={`perm_${resource}_${permAction}`}
                          defaultChecked={existing ? Boolean(existing[ACTION_FIELD[permAction]]) : false}
                          className="h-4 w-4 accent-primary"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {error ? <p className="text-sm text-primary">{error}</p> : null}
      <Button type="submit" variant="cta" disabled={isPending}>
        {isPending ? "A guardar..." : "Guardar"}
      </Button>
    </form>
  );
}
