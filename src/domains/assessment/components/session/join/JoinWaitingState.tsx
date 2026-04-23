export function JoinWaitingState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-2xl flex-1 items-center justify-center px-1 sm:px-0">
      <div className="w-full rounded-[30px] border border-border bg-white/92 p-7 text-center shadow-sm sm:p-10">
        <div className="mx-auto h-3 w-3 animate-pulse rounded-full bg-primary" />
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
          Status
        </p>
        <h2 className="mt-3 text-2xl font-bold text-primary">{title}</h2>
        <p className="mt-3 text-sm leading-6 text-inkd">{description}</p>
      </div>
    </div>
  );
}
