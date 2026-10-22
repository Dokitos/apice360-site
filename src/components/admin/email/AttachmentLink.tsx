"use client";

import { useState } from "react";
import { toast } from "sonner";
import { getAttachmentUrl } from "@/app/admin/(protected)/email/actions";
import { Icon } from "@/components/ui/Icon";

/**
 * Anexo de uma mensagem.
 *
 * O endereço de um anexo recebido é assinado e expira, por isso é pedido no
 * momento do clique em vez de ser desenhado na página — um link gerado ao
 * abrir a mensagem já estaria morto meia hora depois.
 */
export function AttachmentLink({
  id,
  filename,
  size,
}: {
  id: string;
  filename: string;
  size: number | null;
}) {
  const [aPedir, setAPedir] = useState(false);

  async function abrir() {
    setAPedir(true);
    try {
      const url = await getAttachmentUrl(id);
      if (!url) {
        toast.error("Não foi possível obter este anexo.");
        return;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Não foi possível obter este anexo.");
    } finally {
      setAPedir(false);
    }
  }

  return (
    <button
      type="button"
      onClick={abrir}
      disabled={aPedir}
      className="flex items-center gap-2 rounded-lg border border-outline-variant/40 px-3 py-2 text-sm transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
    >
      <Icon name={aPedir ? "hourglass_top" : "attach_file"} className="text-base" />
      <span className="max-w-[18rem] truncate">{filename}</span>
      {size ? <span className="text-xs text-on-surface-variant">{formatarTamanho(size)}</span> : null}
    </button>
  );
}

function formatarTamanho(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
