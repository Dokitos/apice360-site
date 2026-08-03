"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type RevealTag = "div" | "section" | "article" | "header" | "footer" | "li" | "span";

type RevealProps = {
  as?: RevealTag;
  id?: string;
  className?: string;
  delay?: number;
  once?: boolean;
  children: ReactNode;
};

/**
 * Fades + translates children into view as they enter the viewport.
 * Mirrors the IntersectionObserver reveal pattern from the LP, generalized
 * to any section instead of being wired to `section:not(#hero)` globally.
 */
export function Reveal({
  as = "div",
  id,
  className,
  delay = 0,
  once = true,
  children,
}: RevealProps) {
  const elementRef = useRef<Element | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const setRef = (node: Element | null) => {
    elementRef.current = node;
  };

  useEffect(() => {
    const node = elementRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setIsVisible(false);
          }
        });
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [once]);

  const revealProps = {
    id,
    className: cn(isVisible ? "reveal-visible" : "reveal-hidden", className),
    style: delay ? { transitionDelay: `${delay}ms` } : undefined,
  };

  switch (as) {
    case "section":
      return (
        <section ref={setRef} {...revealProps}>
          {children}
        </section>
      );
    case "article":
      return (
        <article ref={setRef} {...revealProps}>
          {children}
        </article>
      );
    case "header":
      return (
        <header ref={setRef} {...revealProps}>
          {children}
        </header>
      );
    case "footer":
      return (
        <footer ref={setRef} {...revealProps}>
          {children}
        </footer>
      );
    case "li":
      return (
        <li ref={setRef} {...revealProps}>
          {children}
        </li>
      );
    case "span":
      return (
        <span ref={setRef} {...revealProps}>
          {children}
        </span>
      );
    default:
      return (
        <div ref={setRef} {...revealProps}>
          {children}
        </div>
      );
  }
}
