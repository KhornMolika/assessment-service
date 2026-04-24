import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/ui/card";
import type { AnalyticsDistributionItem } from "../types/analytics.types";

export default function AnalyticsDistributionCard({
  title,
  description,
  items,
  metricLabel,
}: {
  title: string;
  description: string;
  items: AnalyticsDistributionItem[];
  metricLabel: string;
}) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/40 p-6 text-sm text-inkd">
            No analytics data is available for the current selection.
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-primary">{item.label}</p>
                  <p className="text-xs text-inkd">{item.helper}</p>
                </div>
                <div className="shrink-0 text-sm font-semibold text-primary">
                  {metricLabel === "%" ? `${Math.round(item.value)}%` : `${Math.round(item.value)} ${metricLabel}`}
                </div>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${item.toneClassName}`}
                  style={{ width: `${Math.max((item.value / maxValue) * 100, 10)}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
