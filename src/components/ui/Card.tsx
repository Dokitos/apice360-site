import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: "neon" | "glass" | "plain";
};

export function Card({ variant = "neon", className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg",
        variant === "neon" && "neon-border bg-surface-container-low",
        variant === "glass" && "glass-effect rounded-2xl",
        variant === "plain" && "bg-surface-container-low",
        className,
      )}
      {...props}
    />
  );
}
