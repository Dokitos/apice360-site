import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
  iconClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
};

/** Stylized mountain-peak mark, matching the Ápice 360 brand icon used across print material. */
export function Logo({ className, iconClassName, wordmarkClassName, showWordmark = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("h-8 w-8 text-primary", iconClassName)}
        aria-hidden="true"
      >
        <path d="M24 7 L13 39" />
        <path d="M24 7 L35 39" />
        <path d="M19.5 25 L28.5 25" />
        <path d="M7 39 L17 23" />
        <path d="M41 39 L31 23" />
      </svg>
      {showWordmark ? (
        <span className={cn("font-heading text-headline-md font-bold tracking-tighter text-on-surface", wordmarkClassName)}>
          ÁPICE<span className="text-primary"> 360</span>
        </span>
      ) : null}
    </span>
  );
}
