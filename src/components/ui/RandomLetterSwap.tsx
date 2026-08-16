"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/cn";

const RANDOM_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function randomChar() {
  return RANDOM_CHARS[Math.floor(Math.random() * RANDOM_CHARS.length)];
}

type RandomLetterSwapProps = {
  label: string;
  className?: string;
  /** Delay (seconds) added per letter index before it starts scrambling. */
  staggerDuration?: number;
};

/**
 * Hover effect that scrambles each letter through a few random characters
 * before settling back on the real label, staggered left-to-right.
 *
 * Deliberately plain text swaps (no transform/slide) — animating position on
 * every tick made the whole word visibly wobble as glyphs of different
 * widths swapped in, and a global tick counter meant the settle time for
 * letters past index ~8 went non-positive, so longer labels only ever
 * scrambled their first few characters.
 */
export function RandomLetterSwap({ label, className, staggerDuration = 0.025 }: RandomLetterSwapProps) {
  const [chars, setChars] = useState(() => label.split(""));
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  // Cancelling pending timers alone can leave a letter stuck mid-scramble —
  // if the mouse leaves before that letter's "revert to real char" timer
  // fires, clearing timers cancels that revert too. Always snap back to the
  // real label on top of clearing, so a fast hover-in/out never gets stuck.
  const reset = useCallback(() => {
    clearTimers();
    setChars(label.split(""));
  }, [clearTimers, label]);

  const shuffle = useCallback(() => {
    clearTimers();
    const original = label.split("");
    const flashes = 3;
    const tickMs = 45;

    original.forEach((char, i) => {
      if (char === " ") return;
      const startDelay = i * staggerDuration * 1000;

      for (let f = 0; f < flashes; f++) {
        timers.current.push(
          setTimeout(() => {
            setChars((prev) => {
              const next = [...prev];
              next[i] = randomChar();
              return next;
            });
          }, startDelay + f * tickMs),
        );
      }

      timers.current.push(
        setTimeout(
          () => {
            setChars((prev) => {
              const next = [...prev];
              next[i] = char;
              return next;
            });
          },
          startDelay + flashes * tickMs,
        ),
      );
    });
  }, [label, staggerDuration, clearTimers]);

  return (
    <span className={cn("inline-flex", className)} onMouseEnter={shuffle} onMouseLeave={reset}>
      {chars.map((char, i) => (
        <span key={i} className="inline-block">
          {char === " " ? " " : char}
        </span>
      ))}
    </span>
  );
}
