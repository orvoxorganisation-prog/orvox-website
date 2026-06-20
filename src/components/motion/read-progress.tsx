"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Reading-progress hairline: a yellow signal line drawn along the top of the
 * viewport, scrubbed to how far the reader is through the article body.
 * Decorative; hidden from AT and absent under reduced motion.
 */
export function ReadProgress({ target = "article" }: { target?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      if (reduce || !ref.current) return;
      const article = document.querySelector(target);
      if (!article) return;
      gsap.fromTo(
        ref.current,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: article,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.4,
          },
        },
      );
    },
    { dependencies: [reduce, target] },
  );

  if (reduce) return null;

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-x-0 top-0 z-30 h-0.5 origin-left scale-x-0 bg-yellow"
    />
  );
}
