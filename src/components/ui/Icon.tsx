import { cn } from "@/lib/cn";

type IconProps = {
  name: string;
  className?: string;
  filled?: boolean;
};

/** Wrapper around the Material Symbols Outlined icon font used throughout the LP. */
export function Icon({ name, className, filled = false }: IconProps) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={{
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}`,
      }}
      aria-hidden="true"
    >
      {name}
    </span>
  );
}
