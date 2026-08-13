"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";

type LightboxProps = {
  src: string;
  alt: string;
  children: ReactNode;
  className?: string;
};

/** Wraps a trigger (usually a thumbnail) and opens the full image in a fullscreen overlay on click. */
export function Lightbox({ src, alt, children, className }: LightboxProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} aria-label={`Ampliar ${alt}`}>
        {children}
      </button>

      {typeof document !== "undefined"
        ? createPortal(
            <AnimatePresence>
              {open ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  // Rendered via a portal into <body> — a Reveal-wrapped ancestor's
                  // `transform` would otherwise turn it into the containing block
                  // for this `fixed` overlay, trapping it inside the section's box.
                  className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-6 backdrop-blur-md"
                  onClick={() => setOpen(false)}
                >
                  <button
                    type="button"
                    aria-label="Fechar"
                    onClick={() => setOpen(false)}
                    className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant text-on-surface transition-colors hover:border-primary hover:bg-primary hover:text-on-primary"
                  >
                    <Icon name="close" className="text-2xl" />
                  </button>
                  <motion.img
                    initial={{ scale: 0.92, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.96, opacity: 0 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0.15 }}
                    src={src}
                    alt={alt}
                    onClick={(e) => e.stopPropagation()}
                    className="max-h-[85vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
                  />
                </motion.div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
