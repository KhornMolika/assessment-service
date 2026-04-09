import { Activity, Clock, TrendingUp, type LucideIcon } from "lucide-react";
import type { OperationalHighlight } from "@/src/domains/dashboard/types/dashboard.types";
import DashboardSectionCard from "./DashboardSectionCard";

const highlightIconMap: Record<OperationalHighlight["icon"], LucideIcon> = {
  clock: Clock,
  activity: Activity,
  trendingUp: TrendingUp,
};

export default function OperationalHighlights({
  items,
}: {
  items: OperationalHighlight[];
}) {
  return (
    <DashboardSectionCard
      title="Operational highlights"
      description="What needs attention today."
    >
      <div className="space-y-4">
        {items.map((item) => {
          const Icon = highlightIconMap[item.icon];

          return (
            <div key={item.id} className="flex items-start gap-3 rounded-xl bg-muted p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-card">
                <Icon className="h-5 w-5 text-pm" />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-primary">{item.title}</div>
                <p className="mt-1 text-sm text-inkd">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </DashboardSectionCard>
  );
}
