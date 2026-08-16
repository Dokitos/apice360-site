import { type VariantProps, cva } from "class-variance-authority";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

const buttonStyles = cva(
  "inline-flex items-center justify-center gap-3 rounded-full font-bold uppercase tracking-wide transition-all disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        cta: "bg-gradient-to-r from-primary to-primary-deep text-on-primary hover:scale-105 hover:shadow-[0_0_30px_rgba(255,106,19,0.5)]",
        "cta-outline":
          "border border-primary text-primary bg-primary/5 hover:bg-primary hover:text-on-primary",
        ghost:
          "border border-outline-variant text-on-surface hover:bg-primary hover:border-primary hover:text-on-primary",
        link: "text-primary underline-offset-4 hover:underline normal-case font-medium tracking-normal rounded-none",
      },
      size: {
        sm: "px-5 py-2.5 text-xs",
        md: "px-6 py-3 text-sm",
        lg: "px-10 py-6 text-lg",
      },
    },
    defaultVariants: {
      variant: "cta",
      size: "md",
    },
  },
);

type BaseProps = VariantProps<typeof buttonStyles> & {
  className?: string;
  icon?: string;
  iconPosition?: "left" | "right";
  pulse?: boolean;
  children: React.ReactNode;
};

type ButtonAsButton = BaseProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonAsLink = BaseProps & {
  href: string;
  target?: string;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button({
  variant,
  size,
  className,
  icon,
  iconPosition = "right",
  pulse = false,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    buttonStyles({ variant, size }),
    pulse && "animate-pulse-glow",
    "group",
    className,
  );

  const iconNode = icon ? (
    <Icon
      name={icon}
      className="text-[1.2em] transition-transform group-hover:translate-x-1"
    />
  ) : null;

  const content = (
    <>
      {iconPosition === "left" && iconNode}
      {children}
      {iconPosition === "right" && iconNode}
    </>
  );

  if ("href" in props && props.href) {
    const { href, target } = props;
    return (
      <Link href={href} target={target} className={classes}>
        {content}
      </Link>
    );
  }

  const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
