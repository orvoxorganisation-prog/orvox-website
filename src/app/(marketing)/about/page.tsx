import type { Metadata } from "next";
import Link from "next/link";
import { Mic, Gavel, Users } from "lucide-react";
import { Container, Section } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/motion/reveal";
import { WordReveal } from "@/components/motion/word-reveal";
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "ORVOX is a youth forum for debate and public speaking — registrations, live scoring, and real feedback in one place. Here's why it exists.",
  alternates: { canonical: "/about" },
};

const personas = [
  {
    Icon: Mic,
    title: "Competitors",
    body: "Register once, find your rounds, and get feedback you can act on. School or college, first timer or finalist.",
    accent: "text-teal",
  },
  {
    Icon: Gavel,
    title: "Judges & adjudicators",
    body: "Score on a clear rubric, submit written feedback, and move to the next room without paperwork in the way.",
    accent: "text-yellow",
  },
  {
    Icon: Users,
    title: "Coaches & mentors",
    body: "Follow your students across events, see how they're scored, and point them at the resources that close the gap.",
    accent: "text-rose-deep",
  },
];

const values = [
  { n: "01", title: "Results, not certificates", body: "Every room ends in a standing. Scores publish in minutes, not weeks." },
  { n: "02", title: "Feedback that's specific", body: "No black-box decisions. You see who judged you and exactly what they said." },
  { n: "03", title: "Logistics out of the way", body: "One form, one dashboard, one schedule. The competition should be the hard part." },
];

export default function AboutPage() {
  return (
    <div className="text-canvas">
      {/* Manifesto */}
      <Section className="spotlight relative overflow-hidden pt-32 pb-16 sm:pt-44 sm:pb-24">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[10%] h-72 w-72 rounded-full bg-yellow opacity-[0.08] blur-[110px]"
        />
        <Container>
          <Reveal>
            <Eyebrow>About ORVOX</Eyebrow>
          </Reveal>
          <WordReveal as="h1" className="display-1 mt-7 max-w-4xl text-canvas" stagger={0.05}>
            <span>
              A youth forum for people who'd rather{" "}
              <span className="rounded-[6px] bg-yellow px-3 text-ink-900">argue</span> than scroll.
            </span>
          </WordReveal>
          <Reveal y={20}>
            <p className="mt-8 max-w-xl text-lg leading-relaxed text-ink-300">
              {siteConfig.name} is one place for debate and public speaking: registrations,
              schedules, live scoring, and feedback that actually helps. We built it so the
              competition is the hard part, not the logistics.
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* Mission — full-width statement band */}
      <Section className="relative overflow-hidden border-y border-white/8 bg-stage py-24 sm:py-32">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 bottom-0 h-[26rem] w-[26rem] rounded-full bg-teal opacity-[0.07] blur-[120px]"
        />
        <Container>
          <WordReveal
            as="h2"
            className="display-2 max-w-4xl text-canvas"
            stagger={0.04}
            trigger
          >
            <span>
              Competitions live in spreadsheets and group chats. Results take weeks.
              Feedback is a number with <em className="text-rose-deep">no story.</em>{" "}
              We put the whole season on <em className="text-teal">one stage.</em>
            </span>
          </WordReveal>
          <Reveal stagger={0.12} className="mt-12 grid gap-6 border-t border-white/10 pt-10 text-[15.5px] leading-relaxed text-ink-300 lg:grid-cols-2 lg:gap-16">
            <p data-reveal>
              Find a competition, register in two minutes, follow your rounds, and read
              structured feedback from the adjudicators who judged you, all while the
              season is still live.
            </p>
            <p data-reveal>
              It's built for the students who show up early and stay late, the judges who
              take the rubric seriously, and the coaches who quietly make all of it work.
            </p>
          </Reveal>
        </Container>
      </Section>

      {/* Who it's for — asymmetric split, seats in the room */}
      <Section>
        <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="display-2 text-canvas">
              Three seats, <em className="text-yellow">one room.</em>
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink-400">
              Everyone in an ORVOX room has a job. The platform is built around all three.
            </p>
          </Reveal>
          <Reveal stagger={0.09}>
            {personas.map((p) => (
              <div
                key={p.title}
                data-reveal
                className="grid grid-cols-[auto_1fr] gap-6 border-b border-white/8 py-9 first:pt-0"
              >
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white/6 ring-1 ring-inset ring-white/10">
                  <p.Icon className={`h-5 w-5 ${p.accent}`} strokeWidth={1.75} />
                </span>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-canvas">{p.title}</h3>
                  <p className="mt-2.5 max-w-lg text-[15px] leading-relaxed text-ink-300">{p.body}</p>
                </div>
              </div>
            ))}
          </Reveal>
        </Container>
      </Section>

      {/* How we run it — the rundown (a real ordered sequence) */}
      <Section className="pt-0">
        <Container>
          <div className="rounded-banner panel-raised p-8 sm:p-14">
            <h2 className="display-2 text-canvas">How we run it.</h2>
            <Reveal className="mt-10 border-t border-white/10" stagger={0.09}>
              {values.map((v) => (
                <div
                  key={v.n}
                  data-reveal
                  className="grid grid-cols-[3.5rem_1fr] items-baseline gap-6 border-b border-white/10 py-7 sm:grid-cols-[3.5rem_16rem_1fr]"
                >
                  <span className="font-mono text-sm tabular text-yellow">{v.n}</span>
                  <h3 className="text-lg font-semibold tracking-tight text-canvas">{v.title}</h3>
                  <p className="col-span-2 text-sm leading-relaxed text-ink-300 sm:col-span-1">{v.body}</p>
                </div>
              ))}
            </Reveal>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link href="/signup" className={buttonVariants({ variant: "primary", size: "lg" })}>
                Sign up
              </Link>
              <Link href="/events" className={buttonVariants({ variant: "ghost", size: "lg" })}>
                Browse events
              </Link>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
