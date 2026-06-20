import { Skeleton } from "@/components/ui/skeleton";

/** Dashboard skeleton — mirrors the monitor-wall layout so nothing jumps. */
export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-9 w-72" />
          <Skeleton className="h-4 w-52" />
        </div>
        <div className="flex gap-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <Skeleton className="h-80 rounded-feature" />
        <div className="space-y-3">
          <Skeleton className="h-12 rounded-feature" />
          <Skeleton className="h-24 rounded-feature" />
          <Skeleton className="h-24 rounded-feature" />
        </div>
      </div>
    </div>
  );
}
