function SkeletonBlock({
  className,
}: {
  className: string;
}) {
  return <div className={`animate-pulse rounded-2xl bg-muted ${className}`} />;
}

export default function AssessmentNewLoading() {
  return (
    <div className="space-y-6 px-4 py-4 sm:px-6 lg:px-8">
      <div className="space-y-3">
        <SkeletonBlock className="h-10 w-72" />
        <SkeletonBlock className="h-4 w-96 max-w-full" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-6 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm">
            <SkeletonBlock className="h-6 w-40" />
            <SkeletonBlock className="mt-3 h-3 w-48" />
            <div className="mt-6 space-y-3">
              <SkeletonBlock className="h-16 w-full" />
              <SkeletonBlock className="h-16 w-full" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <SkeletonBlock className="h-3 w-36" />
            <SkeletonBlock className="mt-3 h-8 w-52" />
            <div className="mt-5 grid grid-cols-2 gap-3">
              {Array.from({ length: 4 }, (_, index) => (
                <SkeletonBlock key={index} className="h-20 w-full" />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="space-y-3">
              <SkeletonBlock className="h-7 w-48" />
              <SkeletonBlock className="h-4 w-full" />
            </div>
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              <SkeletonBlock className="h-11 w-full" />
              <SkeletonBlock className="h-11 w-full" />
              <SkeletonBlock className="h-36 w-full xl:col-span-2" />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
            <SkeletonBlock className="h-4 w-72" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <SkeletonBlock className="h-11 w-full" />
              <SkeletonBlock className="h-11 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
