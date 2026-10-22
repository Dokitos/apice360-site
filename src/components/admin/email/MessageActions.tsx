"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { markRead, moveToFolder, toggleStar, deleteMessage } from "@/app/admin/(protected)/email/actions";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import type { EmailFolder } from "@/generated/prisma/client";

export function MessageActions({
  id,
  folder,
  isStarred,
  isRead,
}: {
  id: string;
  folder: EmailFolder;
  isStarred: boolean;
  isRead: boolean;
}) {
  const [pendente, startTransition] = useTransition();
  const router = useRouter();

  function correr(acao: () => Promise<unknown>, erro: string) {
    startTransition(async () => {
      try {
        await acao();
        router.refresh();
      } catch {
        toast.error(erro);
      }
    });
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <Botao
        titulo={isStarred ? "Retirar a estrela" : "Marcar com estrela"}
        icone={isStarred ? "star" : "star_border"}
        ativo={isStarred}
        disabled={pendente}
        onClick={() => correr(() => toggleStar(id), "Não foi possível marcar a mensagem.")}
      />
      <Botao
        titulo={isRead ? "Marcar como não lida" : "Marcar como lida"}
        icone={isRead ? "mark_email_unread" : "mark_email_read"}
        disabled={pendente}
        onClick={() => correr(() => markRead(id, !isRead), "Não foi possível mudar o estado.")}
      />
      {folder === "ARCHIVE" ? (
        <Botao
          titulo="Devolver à caixa de entrada"
          icone="unarchive"
          disabled={pendente}
          onClick={() => correr(() => moveToFolder(id, "INBOX"), "Não foi possível mover a mensagem.")}
        />
      ) : (
        <Botao
          titulo="Arquivar"
          icone="archive"
          disabled={pendente}
          onClick={() => correr(() => moveToFolder(id, "ARCHIVE"), "Não foi possível arquivar.")}
        />
      )}
      <Botao
        titulo="Eliminar definitivamente"
        icone="delete"
        disabled={pendente}
        onClick={() => {
          if (!window.confirm("Eliminar esta mensagem? Esta ação não pode ser desfeita.")) return;
          correr(() => deleteMessage(id), "Não foi possível eliminar a mensagem.");
        }}
      />
    </div>
  );
}

function Botao({
  titulo,
  icone,
  ativo,
  disabled,
  onClick,
}: {
  titulo: string;
  icone: string;
  ativo?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={titulo}
      aria-label={titulo}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg border border-outline-variant/40 transition-colors hover:border-primary hover:text-primary disabled:opacity-50",
        ativo ? "text-primary" : "text-on-surface-variant",
      )}
    >
      <Icon name={icone} className="text-lg" />
    </button>
  );
}
