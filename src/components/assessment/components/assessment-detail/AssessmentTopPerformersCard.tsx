import { Award } from "lucide-react";
import type { AssessmentDetailTopPerformer } from "@/src/types/assessment-detail.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/ui/card";

export default function AssessmentTopPerformersCard({
  topPerformers,
}: {
  topPerformers: AssessmentDetailTopPerformer[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Award className="h-5 w-5" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topPerformers.map((performer, index) => (
          <div
            key={`${performer.name}-${index}`}
            className="flex items-center justify-between rounded-lg p-3 transition hover:bg-muted/40"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accp font-bold text-primary">
                #{index + 1}
              </div>
              <div>
                <div className="font-semibold text-primary">{performer.name}</div>
                <div className="text-xs text-inkd">Completed in {performer.time}</div>
              </div>
            </div>
            <div className="text-lg font-bold text-primary">{performer.score}%</div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
