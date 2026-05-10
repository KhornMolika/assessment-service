export function Skeleton({
  className = "",
}: {
  className?: string;
}) {
  return <div className={`animate-pulse rounded-2xl bg-muted/80 ${className}`.trim()} />;
}
