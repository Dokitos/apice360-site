import { cn } from "@/lib/cn";

type LogoProps = {
  className?: string;
  /**
   * "dark" is the black wordmark (for light backgrounds), "light" the white
   * one (for the ink-colored footer / hero scrim). Both are the same
   * lockup — only the ink of the letters differs.
   */
  variant?: "dark" | "light";
};

const LOGO_SRC: Record<NonNullable<LogoProps["variant"]>, string> = {
  dark: "/images/logo-preta.png",
  light: "/images/logo-branca.png",
};

/**
 * Ápice 360 brand lockup — the full "ÁPICE 360" wordmark supplied by the
 * client, used as a single image rather than icon + live text so the
 * spacing and the orange/red "360" accents stay exactly as in the print
 * material. Height is controlled through className (the image keeps its
 * own aspect ratio).
 */
export function Logo({ className, variant = "dark" }: LogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_SRC[variant]}
      alt="Ápice 360"
      className={cn("h-11 w-auto shrink-0 object-contain", className)}
    />
  );
}
