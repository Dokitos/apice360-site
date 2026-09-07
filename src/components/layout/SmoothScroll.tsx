"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Rotas que gerem o scroll por conta própria. A /lsf usa scroll-snap nativo
 * do CSS para avançar capítulo a capítulo, e o Lenis — que substitui o scroll
 * do browser pelo seu próprio — impede o snap de assentar.
 */
const NO_SMOOTH_SCROLL_ROUTES = ["/lsf"];

/** Mounts once in the public layout to drive inertia smooth-scrolling site-wide. */
export function SmoothScroll() {
  const pathname = usePathname();
  const disabled = NO_SMOOTH_SCROLL_ROUTES.includes(pathname);

  useEffect(() => {
    if (disabled) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - 2 ** (-10 * t)),
    });
    window.__lenis = lenis;

    let frameId: number;
    function raf(time: number) {
      lenis.raf(time);
      frameId = requestAnimationFrame(raf);
    }
    frameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frameId);
      lenis.destroy();
      window.__lenis = undefined;
    };
  }, [disabled]);

  return null;
}
