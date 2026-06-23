function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-2xl bg-muted ${className}`} />;
}

export default function AssessmentsCatalogLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-3">
          <SkeletonBlock className="h-10 w-64" />
          <SkeletonBlock className="h-4 w-80 max-w-full" />
        </div>
        <SkeletonBlock className="h-10 w-full sm:w-60" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <SkeletonBlock className="h-3 w-28" />
                <SkeletonBlock className="h-8 w-20" />
              </div>
              <SkeletonBlock className="h-10 w-10 rounded-2xl" />
            </div>
            <div className="mt-4 space-y-2">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-4/5" />
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <SkeletonBlock className="h-10 w-full max-w-xl" />
            <div className="flex gap-2">
              <SkeletonBlock className="h-10 w-28" />
              <SkeletonBlock className="h-10 w-28" />
              <SkeletonBlock className="h-10 w-28" />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="border-b border-border bg-muted/40 px-4 py-4">
              <div className="grid grid-cols-8 gap-4">
                {Array.from({ length: 8 }, (_, index) => (
                  <SkeletonBlock key={index} className="h-3 w-full" />
                ))}
              </div>
            </div>
            <div className="space-y-4 p-4">
              {Array.from({ length: 5 }, (_, index) => (
                <div key={index} className="grid grid-cols-8 gap-4">
                  {Array.from({ length: 8 }, (_, innerIndex) => (
                    <SkeletonBlock key={innerIndex} className="h-10 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
