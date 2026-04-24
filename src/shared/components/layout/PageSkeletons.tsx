import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function TopbarSkeleton() {
  return (
    <div className="sticky top-0 z-20 w-full border-b border-bdr bg-card px-4 py-3 shadow-sm sm:px-6">
      <div className="flex flex-wrap items-center gap-3 lg:flex-nowrap">
        <Skeleton className="order-3 h-10 w-full lg:order-1 lg:max-w-xl" />
        <div className="order-2 ml-auto flex items-center gap-3">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-20 rounded-xl" />
          <Skeleton className="hidden h-10 w-28 rounded-full sm:block" />
        </div>
      </div>
    </div>
  );
}

function PageHeaderSkeleton({
  hasActions = true,
}: {
  hasActions?: boolean;
}) {
  return (
    <div className="rounded-[28px] border border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,250,248,0.96)_100%)] p-6 shadow-[0_18px_40px_rgba(20,53,43,0.08)] sm:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-72 max-w-full" />
          <Skeleton className="h-4 w-full max-w-3xl" />
          <Skeleton className="h-4 w-4/5 max-w-2xl" />
        </div>
        {hasActions ? <Skeleton className="h-11 w-40 rounded-xl" /> : null}
      </div>
    </div>
  );
}

function StatsGridSkeleton({
  count = 4,
}: {
  count?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border bg-card p-5 shadow-sm"
        >
          <Skeleton className="h-11 w-11 rounded-xl" />
          <Skeleton className="mt-4 h-4 w-28" />
          <Skeleton className="mt-3 h-9 w-24" />
          <Skeleton className="mt-4 h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

function CardGridSkeleton({
  cards = 2,
  rows = 4,
}: {
  cards?: number;
  rows?: number;
}) {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {Array.from({ length: cards }, (_, index) => (
        <div
          key={index}
          className="rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <Skeleton className="h-6 w-40" />
          <Skeleton className="mt-3 h-4 w-full" />
          <div className="mt-6 space-y-4">
            {Array.from({ length: rows }, (_, rowIndex) => (
              <div key={rowIndex} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-3 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TableCardSkeleton({
  rows = 6,
}: {
  rows?: number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="space-y-3 p-6">
        <Skeleton className="h-6 w-56" />
        <Skeleton className="h-4 w-full max-w-2xl" />
      </div>
      <div className="border-t border-border/60 px-6 py-4">
        <div className="space-y-4">
          <div className="grid grid-cols-7 gap-4">
            {Array.from({ length: 7 }, (_, index) => (
              <Skeleton key={index} className="h-4 w-full" />
            ))}
          </div>
          {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="grid grid-cols-7 gap-4">
              {Array.from({ length: 7 }, (_, cellIndex) => (
                <Skeleton key={cellIndex} className="h-10 w-full" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function WorkspacePageSkeleton() {
  return (
    <div className="space-y-6 bg-[linear-gradient(180deg,#F7FAF8_0%,#FFFFFF_30%,#F6FAF7_100%)] p-4">
      <PageHeaderSkeleton />
      <StatsGridSkeleton />
      <CardGridSkeleton />
      <TableCardSkeleton />
    </div>
  );
}

export function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-6 bg-[linear-gradient(180deg,#F7FAF8_0%,#FFFFFF_30%,#F6FAF7_100%)] p-4">
      <PageHeaderSkeleton hasActions={false} />
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <Skeleton className="h-11 w-64 rounded-xl" />
        </div>
      </div>
      <StatsGridSkeleton />
      <CardGridSkeleton rows={3} />
      <CardGridSkeleton cards={1} rows={4} />
      <TableCardSkeleton rows={5} />
    </div>
  );
}

export function ResultsPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <PageHeaderSkeleton />
        <StatsGridSkeleton />
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="grid gap-3 xl:grid-cols-4">
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
          </div>
        </div>
        <TableCardSkeleton rows={8} />
      </div>
    </div>
  );
}
