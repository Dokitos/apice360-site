"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.6);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Voltar ao topo"
      onClick={() => {
        if (window.__lenis) {
          window.__lenis.scrollTo(0, { duration: 1.2 });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }}
      className={cn(
        "fixed bottom-6 left-6 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-outline-variant bg-surface-container text-on-surface shadow-lg transition-all duration-300 hover:border-primary hover:bg-primary hover:text-on-primary",
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <Icon name="arrow_upward" />
    </button>
  );
}
