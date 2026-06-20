import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/ui/page-header";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ResourcesExplorer } from "@/components/resources/resources-explorer";
import { buttonVariants } from "@/components/ui/button";
import { getResources, getFeaturedResource } from "@/lib/repo";
import { trackLabel } from "@/lib/accent";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Resource library",
  description:
    "Debate guides, speaking drills, and templates from the coaches and chairs who run ORVOX rooms. Free, no login.",
  alternates: { canonical: "/resources" },
};

export default async function ResourcesPage() {
  const [all, featured] = await Promise.all([getResources(), getFeaturedResource()]);
  const rest = featured ? all.filter((r) => r.id !== featured.id) : all;

  return (
    <>
      <PageHeader
        eyebrow="library · free, no login"
        tint="teal"
        title={
          <>
            Walk in <em className="text-teal">ready.</em>
          </>
        }
        description="Guides, drills, and templates written for people who actually compete. Read what you need, skip what you don't."
      />

      <Container className="py-12 text-canvas sm:py-16">
        {featured && (
          <Link
            href={`/resources/${featured.slug}`}
            className="group lift relative isolate mb-10 grid overflow-hidden rounded-feature panel-raised hover:border-teal/30 lg:grid-cols-[1.4fr_1fr]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-32 -z-10 h-96 w-96 rounded-full bg-teal opacity-20 blur-[90px]"
            />
            <div className="p-8 sm:p-10">
              <Eyebrow items={["Featured", trackLabel[featured.track]]} />
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-canvas sm:text-4xl">{featured.title}</h2>
              <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-ink-300">
                {featured.description}
              </p>
              <div className="mt-8 flex items-center gap-4">
                <span className={cn(buttonVariants({ variant: "teal", size: "md" }), "group/btn pointer-events-none")}>
                  Read the guide
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[12px] tabular text-ink-400">
                  <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                  {featured.minutes} min · {featured.author}
                </span>
              </div>
            </div>
            <div className="hidden items-center justify-center border-l border-white/8 bg-teal/[0.07] p-10 lg:flex">
              <span className="font-mono text-[7rem] font-semibold leading-none text-teal/50">
                {featured.minutes}
                <span className="text-3xl">m</span>
              </span>
            </div>
          </Link>
        )}

        <ResourcesExplorer resources={rest} />
      </Container>
    </>
  );
}
