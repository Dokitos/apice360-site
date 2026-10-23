"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Icon } from "@/components/ui/Icon";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import type { SiteLocale } from "@/lib/locale";

/**
 * Casca do simulador em modo quiosque, para um tablet deixado à disposição
 * de quem entra na loja.
 *
 * Não há menu, rodapé, nem ligação nenhuma para fora: a única coisa que a
 * página deixa fazer é a simulação. A saída existe — senão nem quem é da casa
 * conseguia recuperar o tablet — mas está escondida atrás de cinco toques
 * seguidos no logótipo, que ninguém acerta por engano.
 *
 * O ecrã inteiro tem de ser pedido a partir de um gesto da pessoa: nenhum
 * browser deixa uma página entrar em ecrã inteiro sozinha.
 */
const TOQUES_PARA_SAIR = 5;
const JANELA_DOS_TOQUES = 3000;

export function KioskShell({ locale, children }: { locale: SiteLocale; children: ReactNode }) {
  const router = useRouter();
  const [emEcraInteiro, setEmEcraInteiro] = useState(false);
  const toques = useRef<number[]>([]);

  useEffect(() => {
    function aoMudar() {
      setEmEcraInteiro(Boolean(document.fullscreenElement));
    }
    document.addEventListener("fullscreenchange", aoMudar);
    return () => document.removeEventListener("fullscreenchange", aoMudar);
  }, []);

  async function alternarEcraInteiro() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Alguns browsers em iOS não permitem ecrã inteiro numa página. O
      // quiosque continua a funcionar, só sem esconder a barra do browser.
      setEmEcraInteiro(Boolean(document.fullscreenElement));
    }
  }

  function tocarNoLogotipo() {
    const agora = Date.now();
    toques.current = [...toques.current.filter((t) => agora - t < JANELA_DOS_TOQUES), agora];
    if (toques.current.length >= TOQUES_PARA_SAIR) {
      toques.current = [];
      if (document.fullscreenElement) void document.exitFullscreen();
      router.push("/");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-container-lowest">
      <header className="flex items-center justify-between gap-4 border-b border-outline-variant/20 bg-surface px-5 py-4 md:px-10">
        <button
          type="button"
          onClick={tocarNoLogotipo}
          aria-label="Ápice 360"
          className="cursor-default"
          title=""
        >
          <Logo className="h-10" />
        </button>
        <div className="flex items-center gap-3">
          <LanguageSwitcher locale={locale} />
          <button
            type="button"
            onClick={alternarEcraInteiro}
            aria-label={emEcraInteiro ? "Sair do ecrã inteiro" : "Ecrã inteiro"}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-outline-variant/40 text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
          >
            <Icon name={emEcraInteiro ? "fullscreen_exit" : "fullscreen"} />
          </button>
        </div>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
