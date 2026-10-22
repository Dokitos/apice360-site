"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { TextField, SelectField } from "@/components/admin/form-fields";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { sendEmail, type ComposeState } from "@/app/admin/(protected)/email/actions";

export type ComposerAccount = { id: string; address: string; displayName: string; isDefault: boolean };
export type ComposerTemplate = { id: string; name: string; subject: string; bodyHtml: string };
type Anexo = { filename: string; url: string; contentType: string | null };

type Props = {
  accounts: ComposerAccount[];
  templates: ComposerTemplate[];
  defaultTo?: string;
  defaultSubject?: string;
  defaultBodyHtml?: string;
  replyToMessageId?: string;
  /** Modo resposta: sem destinatários à vista e sem título próprio. */
  compact?: boolean;
};

export function EmailComposer({
  accounts,
  templates,
  defaultTo = "",
  defaultSubject = "",
  defaultBodyHtml = "",
  replyToMessageId,
  compact = false,
}: Props) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ComposeState, FormData>(sendEmail, undefined);

  const [corpo, setCorpo] = useState(defaultBodyHtml);
  const [assunto, setAssunto] = useState(defaultSubject);
  // Remonta o editor quando um modelo é aplicado: o TipTap guarda o conteúdo
  // por dentro e só o lê do `defaultValue` quando nasce.
  const [versaoDoCorpo, setVersaoDoCorpo] = useState(0);
  const [mostrarCopias, setMostrarCopias] = useState(false);
  const [anexos, setAnexos] = useState<Anexo[]>([]);
  const [aEnviarAnexo, setAEnviarAnexo] = useState(0);
  const ficheiroRef = useRef<HTMLInputElement>(null);
  const contaPorOmissao = accounts.find((c) => c.isDefault) ?? accounts[0];

  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast.success(state.message);
      if (compact) {
        router.refresh();
      } else if (state.id) {
        router.push(`/admin/email/${state.id}`);
      }
    } else {
      toast.error(state.message);
    }
  }, [state, compact, router]);

  function aplicarModelo(id: string) {
    const modelo = templates.find((m) => m.id === id);
    if (!modelo) return;
    setAssunto(modelo.subject);
    setCorpo(modelo.bodyHtml);
    setVersaoDoCorpo((v) => v + 1);
  }

  async function carregarFicheiros(ficheiros: File[]) {
    if (ficheiros.length === 0) return;
    setAEnviarAnexo((n) => n + ficheiros.length);
    const resultados = await Promise.all(
      ficheiros.map(async (ficheiro) => {
        try {
          const blob = await upload(`email/${ficheiro.name}`, ficheiro, {
            access: "public",
            handleUploadUrl: "/api/admin/upload/token",
            contentType: ficheiro.type,
          });
          return { filename: ficheiro.name, url: blob.url, contentType: ficheiro.type || null };
        } catch (causa) {
          const detalhe = causa instanceof Error ? causa.message : "falha ao carregar.";
          toast.error(`${ficheiro.name}: ${detalhe}`);
          return null;
        }
      }),
    );
    setAnexos((atuais) => [...atuais, ...resultados.filter((r): r is Anexo => r !== null)]);
    setAEnviarAnexo((n) => Math.max(0, n - ficheiros.length));
  }

  if (accounts.length === 0) {
    return (
      <p className="rounded-lg border border-outline-variant/20 bg-surface-container-low p-6 text-sm text-on-surface-variant">
        Cria primeiro uma conta de envio em Contas.
      </p>
    );
  }

  return (
    <form action={formAction} className={compact ? "space-y-4" : "max-w-3xl space-y-6"}>
      {replyToMessageId ? <input type="hidden" name="replyToMessageId" value={replyToMessageId} /> : null}
      <input type="hidden" name="attachments" value={JSON.stringify(anexos)} readOnly />

      <div className={compact ? "grid grid-cols-1 gap-4 sm:grid-cols-2" : "grid grid-cols-1 gap-6 sm:grid-cols-2"}>
        <SelectField
          id="accountId"
          name="accountId"
          label="De"
          defaultValue={contaPorOmissao?.id}
          hint={compact ? undefined : "O endereço que aparece a quem recebe."}
        >
          {accounts.map((conta) => (
            <option key={conta.id} value={conta.id}>
              {conta.displayName} ({conta.address})
            </option>
          ))}
        </SelectField>

        {templates.length > 0 ? (
          <SelectField
            id="template"
            name="template"
            label="Modelo"
            defaultValue=""
            onChange={(e) => aplicarModelo(e.target.value)}
            hint={compact ? undefined : "Preenche o assunto e o corpo. Podes editar depois."}
          >
            <option value="">Começar do zero</option>
            {templates.map((modelo) => (
              <option key={modelo.id} value={modelo.id}>
                {modelo.name}
              </option>
            ))}
          </SelectField>
        ) : null}
      </div>

      <TextField
        id="to"
        name="to"
        label="Para"
        defaultValue={defaultTo}
        required
        hint="Vários endereços separados por vírgula."
      />

      {mostrarCopias ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField id="cc" name="cc" label="Cc" />
          <TextField id="bcc" name="bcc" label="Bcc" />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setMostrarCopias(true)}
          className="text-xs font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:text-primary"
        >
          + Cc / Bcc
        </button>
      )}

      <TextField
        id="subject"
        name="subject"
        label="Assunto"
        value={assunto}
        onChange={(e) => setAssunto(e.target.value)}
        required
      />

      <RichTextEditor
        key={versaoDoCorpo}
        id="bodyHtml"
        name="bodyHtml"
        label="Mensagem"
        defaultValue={corpo}
      />

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={aEnviarAnexo > 0}
            onClick={() => ficheiroRef.current?.click()}
            className="flex items-center gap-2 rounded-lg border border-outline-variant/40 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-50"
          >
            <Icon name="attach_file" className="text-base" />
            {aEnviarAnexo > 0 ? `A carregar ${aEnviarAnexo}...` : "Anexar ficheiros"}
          </button>
          <input
            ref={ficheiroRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              // A FileList é viva: copiar antes de limpar o campo.
              const ficheiros = Array.from(e.target.files ?? []);
              e.target.value = "";
              void carregarFicheiros(ficheiros);
            }}
          />
        </div>

        {anexos.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {anexos.map((anexo) => (
              <li
                key={anexo.url}
                className="flex items-center gap-2 rounded-lg border border-outline-variant/40 px-3 py-1.5 text-sm"
              >
                <Icon name="description" className="text-base text-on-surface-variant" />
                <span className="max-w-[16rem] truncate">{anexo.filename}</span>
                <button
                  type="button"
                  aria-label={`Remover ${anexo.filename}`}
                  onClick={() => setAnexos((atuais) => atuais.filter((a) => a.url !== anexo.url))}
                  className="text-on-surface-variant transition-colors hover:text-primary"
                >
                  <Icon name="close" className="text-sm" />
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {state && !state.ok ? <p className="text-sm text-primary">{state.message}</p> : null}

      <Button type="submit" variant="cta" disabled={isPending || aEnviarAnexo > 0}>
        {isPending ? "A enviar..." : compact ? "Responder" : "Enviar mensagem"}
      </Button>
    </form>
  );
}
