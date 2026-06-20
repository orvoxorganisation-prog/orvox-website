"use client";

import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const grouped = new Intl.NumberFormat("en-IN");

/**
 * Count-up that fires when the number scrolls into view. Tabular mono so digits
 * don't jitter. Renders the final value immediately under reduced motion.
 * Formatting is computed internally so no function prop crosses the RSC boundary.
 */
export function CountUp({
  value,
  group = false,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
  duration = 1.4,
}: {
  value: number;
  group?: boolean;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();

  const format = (n: number) => {
    const rounded = decimals > 0 ? Number(n.toFixed(decimals)) : Math.round(n);
    const body = group ? grouped.format(rounded) : rounded.toString();
    return `${prefix}${body}${suffix}`;
  };

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduce) return;
      const obj = { v: 0 };
      el.textContent = format(0);
      gsap.to(obj, {
        v: value,
        duration,
        ease: "power2.out",
        onUpdate: () => {
          el.textContent = format(obj.v);
        },
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      });
    },
    { scope: ref, dependencies: [value, reduce] },
  );

  return (
    <span ref={ref} className={cn("tabular [font-feature-settings:'tnum','zero']", className)}>
      {format(value)}
    </span>
  );
}
