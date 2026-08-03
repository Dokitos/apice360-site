import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

type GradientTextProps = {
  as?: ElementType;
  className?: string;
  children: ReactNode;
};

export function GradientText({
  as: Tag = "span",
  className,
  children,
}: GradientTextProps) {
  return <Tag className={cn("gradient-text", className)}>{children}</Tag>;
}
