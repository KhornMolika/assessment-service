import type { AssessmentDetailRecord } from "@/src/types/assessment-detail.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/ui/card";
import AssessmentDetailActions from "./AssessmentDetailActions";

function QuickActions({
  assessment,
}: {
  assessment: AssessmentDetailRecord;
}) {
  return (
    <Card className="border-border/70 bg-white/95 shadow-[0_18px_44px_rgba(20,53,43,0.08)]">
      <CardHeader>
        <CardTitle className="text-lg">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <AssessmentDetailActions assessment={assessment} />
      </CardContent>
    </Card>
  );
}

export default function AssessmentSidebar({
  assessment,
}: {
  assessment: AssessmentDetailRecord;
}) {
  return (
    <div className="space-y-6">
      <QuickActions assessment={assessment} />
    </div>
  );
}
