import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashHeader } from "@/components/app/dash-header";
import { ResourceCard } from "@/components/resources/resource-card";
import { Reveal } from "@/components/motion/reveal";
import { buttonVariants } from "@/components/ui/button";
import { getResources } from "@/lib/repo";

export const metadata: Metadata = { title: "Resources", robots: { index: false } };

export default async function DashboardResourcesPage() {
  const resources = await getResources();

  return (
    <div className="mx-auto max-w-5xl">
      <DashHeader
        title="Resources"
        description="Guides, drills, and templates picked for the tracks you compete in."
        actions={
          <Link href="/resources" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Full library
            <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
          </Link>
        }
      />

      <Reveal stagger={0.06} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {resources.map((resource) => (
          <div key={resource.id} data-reveal>
            <ResourceCard resource={resource} className="h-full" />
          </div>
        ))}
      </Reveal>
    </div>
  );
}
