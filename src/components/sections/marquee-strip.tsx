import { Marquee } from "@/components/motion/marquee";

const TOKENS: { label: string; dot: string }[] = [
  { label: "British Parliamentary", dot: "bg-teal" },
  { label: "Live adjudication", dot: "bg-yellow" },
  { label: "Four-band rubric", dot: "bg-rose-deep" },
  { label: "Scores in minutes", dot: "bg-teal" },
  { label: "Written feedback", dot: "bg-yellow" },
  { label: "Demo days", dot: "bg-rose-deep" },
  { label: "Op-Ed wall", dot: "bg-teal" },
  { label: "Main-stage finals", dot: "bg-yellow" },
];

/** Broadcast ticker — a dark seam carrying the season's headline facts. */
export function MarqueeStrip() {
  return (
    <div data-stage className="border-y border-white/8 bg-void py-5 text-canvas">
      <Marquee durationSec={44} itemClassName="gap-10 pr-10">
        {TOKENS.map((token, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap">
            <span className="flex items-center gap-3">
              <span className={`h-1.5 w-1.5 rounded-full ${token.dot}`} />
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-ink-300">{token.label}</span>
            </span>
          </span>
        ))}
      </Marquee>
    </div>
  );
}
