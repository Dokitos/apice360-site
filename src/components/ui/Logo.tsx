import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
  iconClassName?: string;
  wordmarkClassName?: string;
  showWordmark?: boolean;
};

/** Ápice 360 brand mark (mountain-peak icon on the brand orange), matching print material. */
export function Logo({ className, iconClassName, wordmarkClassName, showWordmark = true }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/logo.png"
        alt="Ápice 360"
        className={cn("h-8 w-8 shrink-0 rounded-md object-cover", iconClassName)}
      />
      {showWordmark ? (
        <span className={cn("font-heading text-headline-md font-bold tracking-tighter text-on-surface", wordmarkClassName)}>
          ÁPICE<span className="text-primary"> 360</span>
        </span>
      ) : null}
    </span>
  );
}
