"use client";

import { useEffect, useRef, useState, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { slugify } from "@/lib/slugify";
import { CURATED_ICONS } from "@/lib/material-icons";
import { Icon } from "@/components/ui/Icon";

const baseFieldClasses =
  "w-full rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-on-surface outline-none transition-colors focus:border-primary";

function FieldShell({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="font-mono text-label-mono uppercase tracking-widest text-on-surface-variant"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="text-xs text-on-surface-variant/70">{hint}</p> : null}
    </div>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  hint?: string;
};

export function TextField({ label, id, hint, className, ...props }: TextFieldProps) {
  return (
    <FieldShell label={label} htmlFor={id} hint={hint}>
      <input id={id} className={cn(baseFieldClasses, className)} {...props} />
    </FieldShell>
  );
}

type SlugFieldProps = Omit<TextFieldProps, "onChange"> & {
  /** id of a title/name input to auto-generate the slug from until the user edits it manually. */
  sourceId?: string;
};

/**
 * Text field for URL slugs. Auto-fills and live-transliterates from a
 * sibling title field (accented/special characters, e.g. "Construção" →
 * "construcao") so editors never have to hand-type a valid slug.
 */
export function SlugField({ label, id, hint, className, sourceId, defaultValue, ...props }: SlugFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const touchedRef = useRef(Boolean(defaultValue));

  useEffect(() => {
    if (!sourceId) return;
    const source = document.getElementById(sourceId);
    if (!(source instanceof HTMLInputElement)) return;

    function syncFromSource() {
      if (touchedRef.current || !inputRef.current || !(source instanceof HTMLInputElement)) return;
      inputRef.current.value = slugify(source.value);
    }

    source.addEventListener("input", syncFromSource);
    return () => source.removeEventListener("input", syncFromSource);
  }, [sourceId]);

  return (
    <FieldShell label={label} htmlFor={id} hint={hint ?? "Gerado automaticamente a partir do título. Podes editar."}>
      <input
        id={id}
        ref={inputRef}
        defaultValue={defaultValue}
        className={cn(baseFieldClasses, className)}
        onChange={(e) => {
          touchedRef.current = true;
          const el = e.target;
          const cursor = el.selectionStart;
          const before = el.value;
          const after = slugify(before);
          el.value = after;
          if (cursor != null) {
            const pos = Math.max(0, cursor + (after.length - before.length));
            el.setSelectionRange(pos, pos);
          }
        }}
        {...props}
      />
    </FieldShell>
  );
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  id: string;
  hint?: string;
};

export function TextAreaField({ label, id, hint, className, rows = 4, ...props }: TextAreaFieldProps) {
  return (
    <FieldShell label={label} htmlFor={id} hint={hint}>
      <textarea id={id} rows={rows} className={cn(baseFieldClasses, "resize-y", className)} {...props} />
    </FieldShell>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  id: string;
  hint?: string;
};

export function SelectField({ label, id, hint, className, children, ...props }: SelectFieldProps) {
  return (
    <FieldShell label={label} htmlFor={id} hint={hint}>
      <select id={id} className={cn(baseFieldClasses, className)} {...props}>
        {children}
      </select>
    </FieldShell>
  );
}

type CheckboxFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
};

export function CheckboxField({ label, id, className, ...props }: CheckboxFieldProps) {
  return (
    <label htmlFor={id} className="flex items-center gap-3 text-sm text-on-surface">
      <input
        id={id}
        type="checkbox"
        className={cn("h-4 w-4 accent-primary", className)}
        {...props}
      />
      {label}
    </label>
  );
}

type IconPickerFieldProps = {
  label: string;
  id: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
};

/** Click-to-pick grid of Material Symbols icons, with a fallback for typing a custom name. */
export function IconPickerField({
  label,
  id,
  name,
  defaultValue,
  hint = "Clica para escolher um ícone (opcional).",
}: IconPickerFieldProps) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [customMode, setCustomMode] = useState(Boolean(defaultValue) && !CURATED_ICONS.includes(defaultValue ?? ""));

  const filtered = query.trim()
    ? CURATED_ICONS.filter((icon) => icon.includes(query.trim().toLowerCase()))
    : CURATED_ICONS;

  return (
    <FieldShell label={label} htmlFor={id} hint={hint}>
      <input type="hidden" id={id} name={name} value={value} readOnly />
      {customMode ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="ex: verified"
            className={baseFieldClasses}
          />
          <button
            type="button"
            onClick={() => setCustomMode(false)}
            className="shrink-0 rounded-lg border border-outline-variant/40 px-3 py-2.5 text-xs font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            Escolher da lista
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center gap-3 rounded-lg border border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-left text-on-surface transition-colors hover:border-primary"
          >
            {value ? (
              <>
                <Icon name={value} className="text-xl text-primary" />
                <span>{value}</span>
              </>
            ) : (
              <span className="text-on-surface-variant">Sem ícone escolhido</span>
            )}
          </button>
          {open ? (
            <div className="absolute left-0 top-full z-20 mt-2 w-full max-w-sm rounded-lg border border-outline-variant/40 bg-surface p-3 shadow-xl sm:w-96">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Pesquisar ícone..."
                className={cn(baseFieldClasses, "mb-3 py-2")}
                autoFocus
              />
              <div className="grid max-h-64 grid-cols-6 gap-1 overflow-y-auto">
                {filtered.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    title={icon}
                    onClick={() => {
                      setValue(icon);
                      setOpen(false);
                      setQuery("");
                    }}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-primary/10 hover:text-primary",
                      value === icon ? "bg-primary/20 text-primary" : "text-on-surface-variant",
                    )}
                  >
                    <Icon name={icon} className="text-xl" />
                  </button>
                ))}
                {filtered.length === 0 ? (
                  <p className="col-span-6 py-4 text-center text-xs text-on-surface-variant">
                    Nenhum ícone encontrado.
                  </p>
                ) : null}
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-outline-variant/20 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setValue("");
                    setOpen(false);
                  }}
                  className="text-xs text-on-surface-variant hover:text-primary"
                >
                  Remover ícone
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomMode(true);
                    setOpen(false);
                  }}
                  className="text-xs text-on-surface-variant hover:text-primary"
                >
                  Escrever nome manualmente
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </FieldShell>
  );
}

type ImageFieldProps = {
  label: string;
  id: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
};

const IMAGE_ACCEPT = "image/png,image/jpeg,image/webp,image/gif";

export function ImageField({ label, id, name, defaultValue, hint }: ImageFieldProps) {
  const [preview, setPreview] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const urlInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/upload", { method: "POST", body });
      const data: { url?: string; error?: string } | null = await response.json().catch(() => null);

      if (!response.ok || !data?.url) {
        setUploadError(data?.error ?? "Falha ao carregar a imagem.");
        return;
      }

      if (urlInputRef.current) {
        urlInputRef.current.value = data.url;
      }
      setPreview(data.url);
    } catch {
      setUploadError("Falha ao carregar a imagem. Verifica a tua ligação e tenta novamente.");
    } finally {
      setUploading(false);
    }
  }

  function handleFileInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void uploadFile(file);
  }

  return (
    <FieldShell label={label} htmlFor={id} hint={hint ?? "Cola o URL de uma imagem já publicada ou faz upload de um ficheiro."}>
      <div className="flex items-start gap-4">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt=""
            className="h-16 w-16 shrink-0 rounded-lg border border-outline-variant/30 object-cover"
            onError={(e) => {
              e.currentTarget.style.visibility = "hidden";
            }}
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-outline-variant/40 text-center text-xs text-on-surface-variant">
            sem imagem
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2">
          <input
            id={id}
            name={name}
            type="text"
            ref={urlInputRef}
            defaultValue={defaultValue ?? ""}
            placeholder="https://..."
            className={baseFieldClasses}
            onChange={(e) => setPreview(e.target.value)}
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-outline-variant/40 bg-surface-container-low px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-on-surface-variant transition-colors hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-50"
            >
              {uploading ? "A enviar..." : "Carregar ficheiro"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept={IMAGE_ACCEPT}
              className="hidden"
              disabled={uploading}
              onChange={handleFileInputChange}
            />
          </div>
          {uploadError ? <p className="text-xs text-primary">{uploadError}</p> : null}
        </div>
      </div>
    </FieldShell>
  );
}
