"use client";

import { useState, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
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

export function ImageField({ label, id, name, defaultValue, hint }: ImageFieldProps) {
  const [preview, setPreview] = useState(defaultValue ?? "");

  return (
    <FieldShell label={label} htmlFor={id} hint={hint ?? "Cola o URL de uma imagem já publicada (upload direto chega quando o Cloudinary estiver configurado)."}>
      <div className="flex items-center gap-4">
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
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-outline-variant/40 text-xs text-on-surface-variant">
            sem imagem
          </div>
        )}
        <input
          id={id}
          name={name}
          type="url"
          defaultValue={defaultValue ?? ""}
          placeholder="https://..."
          className={baseFieldClasses}
          onChange={(e) => setPreview(e.target.value)}
        />
      </div>
    </FieldShell>
  );
}
