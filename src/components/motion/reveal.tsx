"use client";

import * as React from "react";
import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";

type RevealProps<T extends React.ElementType> = {
  as?: T;
  /** Vertical travel in px. */
  y?: number;
  /** Stagger between [data-reveal] children, in seconds. */
  stagger?: number;
  /** ScrollTrigger start. */
  start?: string;
  /** Animate inner [data-reveal] nodes instead of the wrapper itself. */
  children?: React.ReactNode;
  className?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "children" | "className">;

/**
 * Scroll-reveal wrapper. Enhances an already-visible default: GSAP only hides
 * then reveals when motion is allowed. Reduced-motion + no-JS keep content shown.
 * If the subtree contains [data-reveal] nodes, those are staggered; otherwise the
 * wrapper itself reveals.
 */
export function Reveal<T extends React.ElementType = "div">({
  as,
  y = 18,
  stagger = 0.07,
  start = "top 86%",
  className,
  children,
  ...rest
}: RevealProps<T>) {
  const Tag = (as ?? "div") as React.ElementType;
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      if (reduce) return;
      const root = ref.current;
      if (!root) return;
      const marked = root.querySelectorAll<HTMLElement>("[data-reveal]");
      const targets: Element[] = marked.length ? Array.from(marked) : [root];
      gsap.from(targets, {
        opacity: 0,
        y,
        duration: 0.62,
        ease: "expo.out",
        stagger: marked.length ? stagger : 0,
        scrollTrigger: { trigger: root, start, once: true },
      });
    },
    { scope: ref, dependencies: [reduce] },
  );

  return (
    <Tag ref={ref} className={className} {...rest}>
      {children}
    </Tag>
  );
}
