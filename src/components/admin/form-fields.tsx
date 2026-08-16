"use client";

import { useRef, useState, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

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
            type="url"
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
