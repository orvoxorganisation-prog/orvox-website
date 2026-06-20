import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

/** Events skeleton — masthead, filter rail, billboard, ledger rows. */
export default function EventsLoading() {
  return (
    <>
      <div className="spotlight border-b border-white/8 pt-32 pb-14 sm:pt-40 sm:pb-20">
        <Container>
          <Skeleton className="h-3 w-40" />
          <Skeleton className="mt-6 h-16 w-[28rem] max-w-full" />
          <Skeleton className="mt-6 h-5 w-80 max-w-full" />
        </Container>
      </div>
      <Container className="py-12 sm:py-16">
        <Skeleton className="h-12 w-[26rem] max-w-full rounded-full" />
        <Skeleton className="mt-10 h-72 rounded-feature" />
        <div className="mt-6 space-y-px">
          <Skeleton className="h-24 rounded-none" />
          <Skeleton className="h-24 rounded-none" />
          <Skeleton className="h-24 rounded-none" />
        </div>
      </Container>
    </>
  );
}
