"use client";

import * as React from "react";
import { useRef } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import type { Resource, ResourceType } from "@/lib/data/types";
import { ResourceCard } from "./resource-card";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type TypeFilter = ResourceType | "all";

const filters: { value: TypeFilter; label: string }[] = [
  { value: "all", label: "Everything" },
  { value: "guide", label: "Guides" },
  { value: "drill", label: "Drills" },
  { value: "template", label: "Templates" },
  { value: "reference", label: "Reference" },
];

export function ResourcesExplorer({ resources }: { resources: Resource[] }) {
  const [type, setType] = React.useState<TypeFilter>("all");
  const reduce = useReducedMotion();
  const gridRef = useRef<HTMLDivElement>(null);

  const visible = React.useMemo(
    () => (type === "all" ? resources : resources.filter((r) => r.type === type)),
    [resources, type],
  );

  // Staggered card entrance on scroll into view (and again per filter).
  useGSAP(
    () => {
      if (reduce || !gridRef.current) return;
      gsap.from(gridRef.current.children, {
        opacity: 0,
        y: 26,
        duration: 0.65,
        ease: "expo.out",
        stagger: 0.06,
        scrollTrigger: { trigger: gridRef.current, start: "top 88%", once: true },
      });
    },
    { scope: gridRef, dependencies: [reduce, type] },
  );

  return (
    <div>
      <div className="no-scrollbar -mx-1 flex items-center gap-2 overflow-x-auto px-1 pb-1">
        {filters.map((f) => {
          const active = type === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setType(f.value)}
              aria-pressed={active}
              className={cn(
                "press shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-canvas text-ink-900"
                  : "bg-white/[0.04] text-ink-300 ring-1 ring-inset ring-white/12 hover:bg-white/8 hover:text-canvas",
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <motion.div ref={gridRef} layout={!reduce} className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((resource) => (
            <motion.div
              key={resource.id}
              layout={!reduce}
              initial={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduce ? 1 : 0.97 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
            >
              <ResourceCard resource={resource} className="h-full" />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
