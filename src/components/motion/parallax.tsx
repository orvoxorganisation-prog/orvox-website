"use client";

import * as React from "react";
import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";

/**
 * Subtle scroll parallax. `speed` > 0 drifts down, < 0 drifts up, relative to
 * the scroll. Scrubbed for frame-accurate motion; disabled under reduced motion.
 */
export function Parallax({
  children,
  speed = -60,
  className,
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduce) return;
      gsap.fromTo(
        el,
        { y: -speed / 2 },
        {
          y: speed / 2,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
        },
      );
    },
    { scope: ref, dependencies: [speed, reduce] },
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
