import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/permissions";
import { DataTable } from "@/components/admin/DataTable";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { Icon } from "@/components/ui/Icon";
import { deleteEmailTemplate } from "../actions";

const IDIOMAS: Record<string, string> = { PT: "Português", EN: "Inglês", ES: "Espanhol", FR: "Francês" };

export default async function EmailTemplatesPage() {
  await requirePermission("email", "view");
  const modelos = await prisma.emailTemplate.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-heading text-headline-md">Modelos de mensagem</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Mensagens-tipo que preenchem o assunto e o corpo ao escrever. O texto fica editável depois de
            aplicado.
          </p>
        </div>
        <Link
          href="/admin/email/modelos/novo"
          className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold uppercase text-on-primary transition-transform hover:scale-105"
        >
          <Icon name="add" />
          Novo modelo
        </Link>
      </div>

      <DataTable
        rows={modelos}
        getRowId={(m) => m.id}
        emptyMessage="Ainda não há modelos."
        columns={[
          { header: "Nome", render: (m) => <span className="font-bold">{m.name}</span> },
          { header: "Assunto", render: (m) => m.subject },
          { header: "Idioma", render: (m) => IDIOMAS[m.locale] ?? m.locale },
          {
            header: "Estado",
            render: (m) => (
              <span className={m.isActive ? "text-primary" : "text-on-surface-variant"}>
                {m.isActive ? "Ativo" : "Inativo"}
              </span>
            ),
          },
        ]}
        renderActions={(m) => (
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/email/modelos/${m.id}/editar`}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-primary/10 hover:text-primary"
            >
              <Icon name="edit" className="text-lg" />
            </Link>
            <DeleteButton action={deleteEmailTemplate.bind(null, m.id)} />
          </div>
        )}
      />
    </div>
  );
}
