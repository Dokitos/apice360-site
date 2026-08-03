"use client";

import useEmblaCarousel from "embla-carousel-react";
import { Children, useCallback, useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

type CarouselProps = {
  /** Pre-rendered slides (each child becomes one slide). Keep functions out of this
   *  tree so the carousel can be filled from Server Components — pass JSX, not render props. */
  children: ReactNode;
  /** Tailwind classes controlling how much width each slide takes at each breakpoint. */
  slideClassName?: string;
  showArrows?: boolean;
  showDots?: boolean;
  className?: string;
};

export function Carousel({
  children,
  slideClassName = "flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%]",
  showArrows = true,
  showDots = true,
  className,
}: CarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onInit = () => setScrollSnaps(emblaApi.scrollSnapList());
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());

    onInit();
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onInit);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onInit);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  const slides = Children.toArray(children);

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-6">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={cn("min-w-0 pl-6", slideClassName)}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {showArrows ? (
        <div className="mt-8 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
          >
            <Icon name="chevron_left" />
          </button>
          {showDots ? (
            <div className="flex items-center gap-2">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Ir para o item ${index + 1}`}
                  onClick={() => scrollTo(index)}
                  className={cn(
                    "h-2 w-2 rounded-full transition-all",
                    index === selectedIndex
                      ? "w-6 bg-primary"
                      : "bg-outline-variant",
                  )}
                />
              ))}
            </div>
          ) : null}
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Seguinte"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
          >
            <Icon name="chevron_right" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
