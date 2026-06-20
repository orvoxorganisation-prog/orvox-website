"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

interface TickerItem {
  stat: string;
  label: string;
  line: string;
}

/** Product facts only — no invented people, quotes, or numbers. */
const ITEMS: TickerItem[] = [
  {
    stat: "4",
    label: "tracks, one forum",
    line: "Debate, public speaking, pitch, and op-ed. Pick a lane or run all four.",
  },
  {
    stat: "5×4",
    label: "the scoring rubric",
    line: "Content, style, strategy, impact. Five points each, marked live by the panel.",
  },
  {
    stat: "min",
    label: "results, not weeks",
    line: "Standings publish within minutes of the room closing, with written feedback.",
  },
];

const EASE = [0.16, 1, 0.3, 1] as const;

/** Rotating product ticker for the auth brand panel. Static under reduced motion. */
export function BrandTicker() {
  const reduce = useReducedMotion();
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % ITEMS.length), 5200);
    return () => clearInterval(id);
  }, [reduce]);

  const item = ITEMS[index];

  return (
    <div aria-live="off">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? undefined : { opacity: 0, y: -10 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <div className="font-mono text-6xl font-semibold tabular leading-none tracking-tight text-canvas">
            {item.stat}
          </div>
          <div className="eyebrow mt-3">{item.label}</div>

          <p className="mt-10 max-w-sm font-serif text-xl italic leading-relaxed text-rose-deep">
            {item.line}
          </p>
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex gap-1.5" aria-hidden>
        {ITEMS.map((_, i) => (
          <span
            key={i}
            className={
              i === index
                ? "h-1 w-6 rounded-full bg-yellow transition-all duration-300"
                : "h-1 w-2.5 rounded-full bg-white/15 transition-all duration-300"
            }
          />
        ))}
      </div>
    </div>
  );
}
