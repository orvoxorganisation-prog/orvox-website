"use client";

import * as React from "react";
import { useRef } from "react";
import { useReducedMotion } from "motion/react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Curtain reveal for display type. Each word rises out of its own clip mask,
 * staggered — the brand's "curtain reveal · type". Accepts rich children so an
 * italic-serif accent word still works inside the headline.
 *
 * Renders fully visible by default; the mask + lift only apply when motion is on.
 */
export function WordReveal({
  children,
  className,
  as: Tag = "h1",
  delay = 0,
  stagger = 0.06,
  trigger = false,
}: {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  delay?: number;
  stagger?: number;
  /** If true, reveal on scroll into view; otherwise on mount. */
  trigger?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  useGSAP(
    () => {
      if (reduce) return;
      const root = ref.current;
      if (!root) return;
      const words = root.querySelectorAll<HTMLElement>("[data-word]");
      if (!words.length) return;
      gsap.set(words, { yPercent: 115 });
      gsap.to(words, {
        yPercent: 0,
        duration: 0.9,
        ease: "expo.out",
        stagger,
        delay,
        ...(trigger
          ? { scrollTrigger: { trigger: root, start: "top 85%", once: true } }
          : {}),
      });
    },
    { scope: ref, dependencies: [reduce] },
  );

  return (
    <Tag ref={ref} className={cn("[text-wrap:balance]", className)}>
      {splitWords(children)}
    </Tag>
  );
}

/** Wrap each whitespace-delimited token in a clip mask + lift span. */
function splitWords(node: React.ReactNode, keyPrefix = "w"): React.ReactNode {
  return React.Children.map(node, (child, i) => {
    if (typeof child === "string") {
      return child.split(/(\s+)/).map((token, j) => {
        if (token.trim() === "") return token;
        return (
          <span
            key={`${keyPrefix}-${i}-${j}`}
            className="inline-block overflow-hidden align-bottom"
            style={{
              paddingBottom: "0.12em",
              marginBottom: "-0.12em",
              paddingRight: "0.08em",
              marginRight: "-0.08em",
            }}
          >
            <span data-word className="inline-block will-change-transform">
              {token}
            </span>
          </span>
        );
      });
    }
    if (React.isValidElement(child)) {
      // Recurse into elements (e.g. an italic accent span) so their words mask too.
      const el = child as React.ReactElement<{ children?: React.ReactNode }>;
      return React.cloneElement(el, {
        children: splitWords(el.props.children, `${keyPrefix}-${i}`),
      });
    }
    return child;
  });
}
