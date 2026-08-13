"use client";

import { useCallback, useState } from "react";
import { AnimatePresence, motion, type Transition } from "motion/react";
import { cn } from "@/lib/cn";

const RANDOM_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function randomChar() {
  return RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
}

type RandomLetterSwapProps = {
  label: string;
  className?: string;
  staggerDuration?: number;
  transition?: Transition;
};

/**
 * Hover effect that scrambles each letter through a few random characters
 * before settling back on the real label, staggered left-to-right with a
 * spring slide+fade per letter (via AnimatePresence key changes).
 */
export function RandomLetterSwap({
  label,
  className,
  staggerDuration = 0.025,
  transition = { duration: 0.5, type: "spring" },
}: RandomLetterSwapProps) {
  const [chars, setChars] = useState(() => label.split(""));
  const [isAnimating, setIsAnimating] = useState(false);

  const shuffle = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    const original = label.split("");
    const maxTicks = 4;
    let tick = 0;

    const interval = setInterval(() => {
      tick += 1;
      setChars(
        original.map((char, i) => {
          if (char === " ") return " ";
          const settleAt = maxTicks - Math.floor(i / 2);
          return tick >= settleAt ? char : randomChar();
        }),
      );
      if (tick >= maxTicks + original.length) {
        clearInterval(interval);
        setChars(original);
        setIsAnimating(false);
      }
    }, 45);
  }, [label, isAnimating]);

  return (
    <span className={cn("inline-flex", className)} onMouseEnter={shuffle}>
      {chars.map((char, i) => (
        <span key={i} className="relative inline-block overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={`${char}-${i}`}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ ...transition, delay: i * staggerDuration }}
              className="inline-block"
            >
              {char === " " ? " " : char}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  );
}
