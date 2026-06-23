function LoadingBlock({
  className,
}: {
  className: string;
}) {
  return <div className={`animate-pulse rounded-2xl bg-white/70 ${className}`} />;
}

export function AssessmentSessionLoading() {
  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(circle_at_top,#d8f3dc,transparent_38%),linear-gradient(180deg,#f7f5f0_0%,#f2ede2_100%)] px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-6">
      <div className="mx-auto grid min-h-[calc(100dvh-1.5rem)] max-w-7xl gap-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6">
        <section className="rounded-4xl border border-white/70 bg-white/80 p-5 shadow-xl backdrop-blur sm:p-6 lg:p-10">
          <LoadingBlock className="h-4 w-48" />
          <LoadingBlock className="mt-5 h-10 w-full max-w-2xl" />
          <LoadingBlock className="mt-4 h-4 w-full max-w-xl" />

          <div className="mt-10 rounded-3xl border border-border/70 bg-white/70 p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <LoadingBlock className="h-8 w-36" />
              <LoadingBlock className="h-10 w-32" />
            </div>
            <LoadingBlock className="mt-8 h-8 w-4/5 max-w-2xl" />
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <LoadingBlock className="h-16 w-full" />
              <LoadingBlock className="h-16 w-full" />
              <LoadingBlock className="h-16 w-full" />
              <LoadingBlock className="h-16 w-full" />
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <LoadingBlock className="h-36 w-full" />
          <LoadingBlock className="h-44 w-full" />
        </aside>
      </div>
    </main>
  );
}
