"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export type MediaItem = {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: string;
  kind: "image" | "video";
};

type MediaPickerProps = {
  onClose: () => void;
  onSelect: (items: MediaItem[]) => void;
  /** Deixa escolher vários de uma vez e mostra o botão de confirmação. */
  multiple?: boolean;
  /** "media" inclui os vídeos; a predefinição mostra só imagens. */
  kind?: "image" | "media";
  /** URL já escolhido, para aparecer marcado ao abrir. */
  currentUrl?: string | null;
};

const POR_PAGINA = 48;

/**
 * Biblioteca do que já foi carregado para o armazenamento.
 *
 * Existe porque o painel só sabia enviar ficheiros: usar a mesma fotografia
 * em duas páginas obrigava a enviá-la duas vezes, e o armazenamento ficava
 * com cópias do mesmo ficheiro com nomes diferentes.
 *
 * Desenha-se no <body> através de um portal. Os formulários do painel ficam
 * dentro de cartões com overflow escondido e, nas secções, dentro de um bloco
 * com transform — um `position: fixed` ali dentro é recortado pelo cartão em
 * vez de cobrir o ecrã.
 */
export function MediaPicker({ onClose, onSelect, multiple = false, kind = "image", currentUrl }: MediaPickerProps) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [procura, setProcura] = useState("");
  const [visiveis, setVisiveis] = useState(POR_PAGINA);
  const [escolhidos, setEscolhidos] = useState<string[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/admin/media?kind=${kind}`, { signal: controller.signal })
      .then(async (resposta) => {
        const dados: { items?: MediaItem[]; error?: string } | null = await resposta.json().catch(() => null);
        if (!resposta.ok || !dados?.items) {
          setErro(dados?.error ?? "Não foi possível ler a biblioteca.");
          return;
        }
        setItems(dados.items);
      })
      .catch((causa: unknown) => {
        if (causa instanceof DOMException && causa.name === "AbortError") return;
        setErro("Não foi possível ler a biblioteca. Verifica a ligação.");
      });

    return () => controller.abort();
  }, [kind]);

  useEffect(() => {
    function aoTeclar(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", aoTeclar);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowAnterior;
    };
  }, [onClose]);

  const termo = procura.trim().toLowerCase();
  const filtrados = (items ?? []).filter((item) => !termo || item.pathname.toLowerCase().includes(termo));
  const mostrados = filtrados.slice(0, visiveis);

  function escolher(item: MediaItem) {
    if (!multiple) {
      onSelect([item]);
      onClose();
      return;
    }
    setEscolhidos((atuais) =>
      atuais.includes(item.url) ? atuais.filter((url) => url !== item.url) : [...atuais, item.url],
    );
  }

  function confirmar() {
    const porUrl = new Map(filtrados.map((item) => [item.url, item]));
    const selecionados = escolhidos.map((url) => porUrl.get(url)).filter((item): item is MediaItem => Boolean(item));
    if (selecionados.length > 0) onSelect(selecionados);
    onClose();
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Biblioteca de imagens"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="flex max-h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-outline-variant/30 bg-surface shadow-2xl">
        <div className="flex items-center gap-3 border-b border-outline-variant/20 p-4">
          <h2 className="font-heading text-headline-sm">Biblioteca</h2>
          <input
            type="search"
            value={procura}
            onChange={(event) => {
              setProcura(event.target.value);
              setVisiveis(POR_PAGINA);
            }}
            placeholder="Procurar pelo nome do ficheiro..."
            className="ml-auto w-56 rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant hover:bg-surface-container-high"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {erro ? <p className="py-10 text-center text-sm text-primary">{erro}</p> : null}

          {!erro && items === null ? (
            <p className="py-10 text-center text-sm text-on-surface-variant">A carregar a biblioteca...</p>
          ) : null}

          {items !== null && filtrados.length === 0 ? (
            <p className="py-10 text-center text-sm text-on-surface-variant">
              {termo
                ? "Nenhum ficheiro com esse nome."
                : "Ainda não há nada no armazenamento. Carrega um ficheiro primeiro."}
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {mostrados.map((item) => {
              const marcado = multiple ? escolhidos.includes(item.url) : item.url === currentUrl;
              return (
                <button
                  key={item.url}
                  type="button"
                  onClick={() => escolher(item)}
                  title={item.pathname}
                  className={cn(
                    "group overflow-hidden rounded-lg border-2 text-left transition-colors",
                    marcado ? "border-primary" : "border-transparent hover:border-outline-variant/60",
                  )}
                >
                  <div className="relative aspect-square bg-surface-container-low">
                    {item.kind === "video" ? (
                      <span className="flex h-full w-full items-center justify-center text-on-surface-variant">
                        <Icon name="movie" className="text-3xl" />
                      </span>
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                    )}
                    {marcado ? (
                      <span className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary">
                        <Icon name="check" className="text-base" />
                      </span>
                    ) : null}
                  </div>
                  <span className="block truncate px-2 py-1.5 text-[11px] text-on-surface-variant">
                    {nomeCurto(item.pathname)}
                  </span>
                </button>
              );
            })}
          </div>

          {filtrados.length > mostrados.length ? (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setVisiveis((n) => n + POR_PAGINA)}
                className="rounded-lg border border-outline-variant/40 px-4 py-2 text-xs font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container-high"
              >
                Mostrar mais ({filtrados.length - mostrados.length})
              </button>
            </div>
          ) : null}
        </div>

        {multiple ? (
          <div className="flex items-center justify-between gap-4 border-t border-outline-variant/20 p-4">
            <span className="text-xs text-on-surface-variant">
              {escolhidos.length === 0
                ? "Clica para escolher. Podes escolher vários."
                : `${escolhidos.length} escolhido${escolhidos.length === 1 ? "" : "s"}`}
            </span>
            <button
              type="button"
              onClick={confirmar}
              disabled={escolhidos.length === 0}
              className="rounded-lg bg-primary px-5 py-2 text-xs font-bold uppercase tracking-wide text-on-primary transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Adicionar
            </button>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

/** "uploads/imagem-A1b2C3.png" → "imagem-A1b2C3.png" */
function nomeCurto(pathname: string) {
  const barra = pathname.lastIndexOf("/");
  return barra === -1 ? pathname : pathname.slice(barra + 1);
}
