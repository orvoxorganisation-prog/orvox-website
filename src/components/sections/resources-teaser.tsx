import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { Container, Section } from "@/components/ui/container";
import { Reveal } from "@/components/motion/reveal";
import { getResources } from "@/lib/repo";
import { trackLabel } from "@/lib/accent";

/** Editorial split — sticky pitch on the left, a clean reading list on the right. */
export async function ResourcesTeaser() {
  const list = (await getResources()).slice(0, 5);

  return (
    <section className="relative overflow-hidden bg-void text-canvas">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-48 bottom-12 h-[30rem] w-[30rem] rounded-full bg-rose-deep opacity-[0.07] blur-[120px]"
      />
      <Section className="relative">
        <Container className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <h2 data-reveal className="text-5xl font-bold tracking-tight sm:text-6xl">
              Walk in <em className="font-serif text-rose-deep">ready.</em>
            </h2>
            <p data-reveal className="mt-6 max-w-sm text-[15px] leading-relaxed text-ink-400">
              Guides, drills, and templates from the coaches and chairs who run the
              rooms. Free, no login, written for people who actually compete.
            </p>
            <Link
              href="/resources"
              data-reveal
              className="group mt-8 inline-flex items-center gap-2.5 rounded-full bg-canvas py-2 pl-5 pr-2 text-sm font-semibold text-stage active:scale-[0.97]"
            >
              Open the library
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-900/10 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </span>
            </Link>
          </Reveal>

          <Reveal className="border-t border-white/8" stagger={0.05}>
            {list.map((r) => (
              <Link
                key={r.id}
                href={`/resources/${r.slug}`}
                data-reveal
                className="group flex items-center justify-between gap-6 border-b border-white/8 py-6 transition-colors hover:bg-white/[0.025]"
              >
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold tracking-tight text-canvas transition-transform duration-300 group-hover:translate-x-1">
                    {r.title}
                  </h3>
                  <p className="mt-1.5 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-ink-400">
                    {trackLabel[r.track]}
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-3 w-3" strokeWidth={1.5} /> {r.minutes} min
                    </span>
                  </p>
                </div>
                <ArrowUpRight className="h-4.5 w-4.5 shrink-0 text-ink-500 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-canvas" strokeWidth={1.5} />
              </Link>
            ))}
          </Reveal>
        </Container>
      </Section>
    </section>
  );
}
