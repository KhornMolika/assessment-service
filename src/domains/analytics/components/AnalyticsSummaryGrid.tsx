import { BarChart3, ClipboardList, GraduationCap, Users } from "lucide-react";
import { Card, CardContent } from "@/src/shared/components/ui/card";
import type { AnalyticsSummaryStat } from "../types/analytics.types";

const icons = [BarChart3, Users, ClipboardList, GraduationCap];

export default function AnalyticsSummaryGrid({
  items,
}: {
  items: AnalyticsSummaryStat[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => {
        const Icon = icons[index] ?? BarChart3;

        return (
          <Card
            key={item.id}
            className={index === 0 ? "border-primary bg-primary text-white" : undefined}
          >
            <CardContent className="p-5">
              <div
                className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${
                  index === 0 ? "bg-white/15" : "bg-muted text-primary"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className={index === 0 ? "text-sm text-white/75" : "text-sm text-inkd"}>
                {item.label}
              </div>
              <div className="mt-2 text-3xl font-bold">{item.value}</div>
              <p className={index === 0 ? "mt-3 text-sm text-white/80" : "mt-3 text-sm text-inkd"}>
                {item.helper}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
