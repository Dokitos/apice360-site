import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-20 flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow ? (
        <span className="font-mono text-label-mono uppercase tracking-[0.3em] text-primary">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="font-heading text-headline-lg text-on-surface">{title}</h2>
      {subtitle ? (
        <p className="max-w-2xl text-body-lg text-on-surface-variant leading-relaxed">
          {subtitle}
        </p>
      ) : null}
      {align === "center" ? (
        <span className="mt-2 h-1 w-24 rounded-full bg-primary" />
      ) : null}
    </div>
  );
}
