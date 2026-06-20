import Link from "next/link";
import { ArrowUpRight, Clock, FileText, Dumbbell, LayoutTemplate, Play, BookMarked } from "lucide-react";
import type { Resource, ResourceType } from "@/lib/data/types";
import { Badge } from "@/components/ui/badge";
import { trackLabel } from "@/lib/accent";
import { cn } from "@/lib/utils";

const typeMeta: Record<ResourceType, { label: string; Icon: typeof FileText }> = {
  guide: { label: "Guide", Icon: FileText },
  drill: { label: "Drill", Icon: Dumbbell },
  template: { label: "Template", Icon: LayoutTemplate },
  video: { label: "Video", Icon: Play },
  reference: { label: "Reference", Icon: BookMarked },
};

export function ResourceCard({
  resource,
  variant = "default",
  className,
}: {
  resource: Resource;
  variant?: "default" | "compact";
  className?: string;
}) {
  const meta = typeMeta[resource.type];
  const href = `/resources/${resource.slug}`;

  if (variant === "compact") {
    return (
      <Link
        href={href}
        className={cn(
          "group flex items-center gap-4 rounded-card px-4 py-3.5 transition-colors duration-200 hover:bg-white/[0.04]",
          className,
        )}
      >
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/8 text-ink-300 transition-colors group-hover:bg-canvas group-hover:text-ink-900">
          <meta.Icon className="h-4.5 w-4.5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold tracking-tight text-canvas">{resource.title}</p>
          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-ink-400">
            {meta.label} · {resource.minutes} min
          </p>
        </div>
        <ArrowUpRight className="h-4 w-4 shrink-0 text-ink-500 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-canvas" strokeWidth={1.75} />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group lift flex h-full flex-col rounded-card panel p-6 hover:border-white/20",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <Badge variant="muted" size="sm" className="gap-1.5">
          <meta.Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
          {meta.label}
        </Badge>
        <span className="font-mono text-[11px] uppercase tracking-wide text-ink-400">
          {trackLabel[resource.track]}
        </span>
      </div>

      <h3 className="mt-5 text-lg font-semibold leading-snug tracking-tight text-canvas">
        {resource.title}
      </h3>
      <p className="mt-2 line-clamp-3 text-[13.5px] leading-relaxed text-ink-400">
        {resource.description}
      </p>

      <div className="mt-auto flex items-center justify-between gap-3 pt-6 text-[12px] text-ink-400">
        <span className="truncate">{resource.author}</span>
        <span className="inline-flex items-center gap-1.5 font-mono tabular">
          <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
          {resource.minutes} min
        </span>
      </div>
    </Link>
  );
}
