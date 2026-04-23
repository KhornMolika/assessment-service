import type { AssessmentResultsPageData } from "@/src/domains/assessment/types/assessment-results.types";
import { Card, CardContent } from "@/src/shared/components/ui/card";
import { getStatCards } from "./results.utils";

export function ResultsStats({
  stats,
}: {
  stats: AssessmentResultsPageData["stats"];
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {getStatCards(stats).map((stat) => (
        <Card
          key={stat.label}
          className="relative overflow-hidden border-border/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(247,250,248,0.96)_100%)] shadow-[0_18px_40px_rgba(20,53,43,0.08)]"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(33,128,141,0.15)_0%,rgba(33,128,141,0.85)_50%,rgba(33,128,141,0.15)_100%)]" />
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-inkd/80">
                  {stat.label}
                </p>
                <p className="mt-4 text-3xl font-bold tracking-tight text-primary">{stat.value}</p>
              </div>
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ring-1 ring-black/5 ${stat.iconClassName}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-inkd/80">
              <span className="inline-flex h-2 w-2 rounded-full bg-[var(--sage)]" />
              <span>Updates with the selected assessment</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
