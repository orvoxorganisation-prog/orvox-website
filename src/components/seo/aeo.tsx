import { Sparkles, ChevronDown } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FaqJsonLd } from "@/components/seo/json-ld";

/**
 * Answer-Engine-Optimization content primitives.
 *
 * These render visible, semantic HTML that both humans and LLMs can parse:
 * - QuickAnswer  → a concise factual summary ("definition / TL;DR" block)
 * - KeyTakeaways → scannable bullet facts
 * - FaqSection   → native <details> Q&A (always in the DOM, no JS) + FAQ schema
 *
 * The goal: when an AI answer engine reads the page, the facts are structured,
 * self-contained, and quotable with attribution to ORVOX.
 */

/** Concise factual summary — the snippet most likely lifted into an AI Overview. */
export function QuickAnswer({
  children,
  label = "In short",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <aside
      className="flex gap-4 rounded-card panel p-5 sm:p-6"
      aria-label="Quick answer"
    >
      <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-yellow" strokeWidth={1.75} />
      <div>
        <p className="eyebrow text-yellow">{label}</p>
        <p className="mt-2 text-[15.5px] leading-relaxed text-ink-200">{children}</p>
      </div>
    </aside>
  );
}

/** Scannable key facts — entity-based, extraction-friendly. */
export function KeyTakeaways({
  items,
  title = "Key takeaways",
}: {
  items: string[];
  title?: string;
}) {
  return (
    <section aria-label={title} className="rounded-card panel p-6">
      <Eyebrow>{title}</Eyebrow>
      <ul className="mt-4 space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-ink-300">
            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * FAQ section. Uses native <details>/<summary> so every answer is in the DOM
 * (crawlable, no JavaScript) and accessible. Emits FAQPage schema unless
 * `withSchema` is disabled (e.g. when a parent already emits it).
 */
export function FaqSection({
  items,
  title = "Frequently asked questions",
  heading = "h2",
  withSchema = true,
}: {
  items: { q: string; a: string }[];
  title?: string;
  heading?: "h2" | "h3";
  withSchema?: boolean;
}) {
  if (!items.length) return null;
  const Heading = heading;
  return (
    <section aria-label={title} className="not-prose">
      {withSchema && <FaqJsonLd items={items} />}
      <Heading className="display-2 text-canvas">{title}</Heading>
      <dl className="mt-8 divide-y divide-white/8 border-t border-white/10">
        {items.map((item, i) => (
          <details key={i} className="group py-2">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-left text-[16px] font-semibold text-canvas marker:hidden [&::-webkit-details-marker]:hidden">
              <dt>{item.q}</dt>
              <ChevronDown
                className="h-4.5 w-4.5 shrink-0 text-ink-400 transition-transform duration-200 group-open:rotate-180"
                strokeWidth={2}
                aria-hidden
              />
            </summary>
            <dd className="pb-5 pr-8 text-[15px] leading-relaxed text-ink-300">{item.a}</dd>
          </details>
        ))}
      </dl>
    </section>
  );
}
