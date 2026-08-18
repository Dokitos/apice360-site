import { cn } from "@/lib/cn";

/** Renders admin-authored rich text (already sanitized server-side on save). */
export function RichText({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={cn("prose max-w-none leading-relaxed prose-headings:font-heading prose-a:text-primary", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
