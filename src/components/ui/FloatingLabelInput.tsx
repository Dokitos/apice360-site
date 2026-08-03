import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const fieldClasses =
  "w-full bg-surface-container-low border-b-2 border-outline-variant focus:border-primary focus:ring-0 px-4 py-4 text-on-surface transition-all placeholder-transparent outline-none";

const labelClasses = "text-sm uppercase font-mono";

type FloatingLabelInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  error?: string;
};

export function FloatingLabelInput({
  label,
  id,
  error,
  className,
  ...props
}: FloatingLabelInputProps) {
  return (
    <div className="floating-label-container">
      <input
        id={id}
        placeholder={label}
        className={cn(fieldClasses, className)}
        {...props}
      />
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      {error ? <p className="mt-2 text-xs text-primary">{error}</p> : null}
    </div>
  );
}

type FloatingLabelTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  id: string;
  error?: string;
};

export function FloatingLabelTextarea({
  label,
  id,
  error,
  className,
  rows = 3,
  ...props
}: FloatingLabelTextareaProps) {
  return (
    <div className="floating-label-container">
      <textarea
        id={id}
        placeholder={label}
        rows={rows}
        className={cn(fieldClasses, className)}
        {...props}
      />
      <label htmlFor={id} className={labelClasses}>
        {label}
      </label>
      {error ? <p className="mt-2 text-xs text-primary">{error}</p> : null}
    </div>
  );
}
