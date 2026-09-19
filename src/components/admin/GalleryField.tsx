"use client";

import { useRef, useState } from "react";
import { upload } from "@vercel/blob/client";
import { Icon } from "@/components/ui/Icon";

export type GalleryImage = { url: string; alt: string; mediaType: "IMAGE" | "VIDEO" };

const MEDIA_ACCEPT = "image/png,image/jpeg,image/webp,image/gif,video/mp4,video/webm";

/**
 * Galeria de imagens de um projeto, dentro do próprio formulário.
 *
 * Antes cada imagem era uma página à parte, alcançável só depois de gravar o
 * projeto — quem estava a criar um projeto novo tinha de o gravar a meio só
 * para poder juntar fotografias. Aqui a lista vive no formulário e viaja com
 * ele num campo escondido, por isso funciona igual a criar e a editar.
 *
 * Aceita fotografias e vídeos, vários de uma vez, enviados em paralelo. Cada
 * ficheiro reporta o seu próprio erro: um falhar não leva os outros atrás.
 */
export function GalleryField({
  name,
  defaultValue = [],
}: {
  name: string;
  defaultValue?: GalleryImage[];
}) {
  const [images, setImages] = useState<GalleryImage[]>(defaultValue);
  const [pending, setPending] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadOne(file: File): Promise<GalleryImage | string> {
    const isVideo = file.type.startsWith("video/");
    try {
      // Vai do browser directo para o Blob: um vídeo nunca caberia no corpo
      // de um pedido para uma função serverless (ver api/admin/upload/token).
      const blob = await upload(`portfolio/${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/admin/upload/token",
        contentType: file.type,
      });
      return { url: blob.url, alt: "", mediaType: isVideo ? "VIDEO" : "IMAGE" };
    } catch (error) {
      const detail = error instanceof Error ? error.message : "falha ao carregar.";
      return `${file.name}: ${detail}`;
    }
  }

  async function handleFiles(files: File[]) {
    if (files.length === 0) return;
    setErrors([]);
    setPending((n) => n + files.length);

    // Em paralelo, mas cada resultado tratado por si: as que passarem são
    // acrescentadas mesmo que outras falhem.
    const results = await Promise.all(files.map(uploadOne));
    const ok = results.filter((r): r is GalleryImage => typeof r !== "string");
    const failed = results.filter((r): r is string => typeof r === "string");

    if (ok.length > 0) setImages((current) => [...current, ...ok]);
    if (failed.length > 0) setErrors(failed);
    setPending((n) => Math.max(0, n - files.length));
  }

  function move(index: number, direction: -1 | 1) {
    setImages((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {/* O que o servidor recebe. A ordem do array é a ordem da galeria. */}
      <input type="hidden" name={name} value={JSON.stringify(images)} readOnly />

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={pending > 0}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending > 0 ? `A enviar ${pending}...` : "Adicionar imagens ou vídeos"}
        </button>
        <span className="text-xs text-on-surface-variant/70">
          {images.length > 0
            ? `${images.length} ficheiro${images.length === 1 ? "" : "s"}`
            : "Podes escolher vários de uma vez. Fotografias e vídeos MP4 ou WebM."}
        </span>
        <input
          ref={fileInputRef}
          type="file"
          accept={MEDIA_ACCEPT}
          multiple
          className="hidden"
          disabled={pending > 0}
          onChange={(e) => {
            // Copiar para um array antes de limpar o input: a FileList é
            // viva, e pôr value="" esvazia-a antes de a chegarmos a ler.
            const files = Array.from(e.target.files ?? []);
            e.target.value = "";
            void handleFiles(files);
          }}
        />
      </div>

      {errors.length > 0 ? (
        <ul className="space-y-1 text-xs text-primary">
          {errors.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      ) : null}

      {images.length > 0 ? (
        <ul className="space-y-3">
          {images.map((image, index) => (
            <li
              key={`${image.url}-${index}`}
              className="flex items-center gap-4 rounded-lg border border-outline-variant/30 p-3"
            >
              {image.mediaType === "VIDEO" ? (
                <video
                  src={image.url}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-16 w-24 shrink-0 rounded bg-black object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image.url} alt="" className="h-16 w-24 shrink-0 rounded object-cover" />
              )}
              <input
                type="text"
                value={image.alt}
                placeholder="Descrição (opcional)"
                onChange={(e) =>
                  setImages((current) =>
                    current.map((img, i) => (i === index ? { ...img, alt: e.target.value } : img)),
                  )
                }
                className="min-w-0 flex-1 rounded-lg border border-outline-variant/40 bg-surface px-3 py-2 text-sm"
              />
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  aria-label="Mover para cima"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-30"
                >
                  <Icon name="arrow_upward" className="text-base" />
                </button>
                <button
                  type="button"
                  aria-label="Mover para baixo"
                  onClick={() => move(index, 1)}
                  disabled={index === images.length - 1}
                  className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:opacity-30"
                >
                  <Icon name="arrow_downward" className="text-base" />
                </button>
                <button
                  type="button"
                  aria-label="Remover"
                  onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                  className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-primary"
                >
                  <Icon name="delete" className="text-base" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
