"use client";

import { useEffect } from "react";
import { markRead } from "@/app/admin/(protected)/email/actions";

/**
 * Marca a mensagem como lida assim que alguém a abre.
 *
 * Fica num componente de cliente porque um componente de servidor não pode
 * escrever na base de dados enquanto desenha a página — e porque abrir a
 * mensagem é um gesto de quem está a ler, não um efeito de a página existir.
 */
export function MarkReadOnOpen({ id, alreadyRead }: { id: string; alreadyRead: boolean }) {
  useEffect(() => {
    if (alreadyRead) return;
    void markRead(id, true);
  }, [id, alreadyRead]);

  return null;
}
