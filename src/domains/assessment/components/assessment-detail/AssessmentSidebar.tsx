import Link from "next/link";
import { ArrowRight, BarChart3, Settings2 } from "lucide-react";
import type { AssessmentDetailRecord } from "@/src/domains/assessment/types/assessment-detail.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/shared/components/ui/card";
import AssessmentDetailActions from "./AssessmentDetailActions";

function AssessmentSettings({
  assessment,
}: {
  assessment: AssessmentDetailRecord;
}) {
  const settings = [
    { label: "Participant identity", value: assessment.participant_identity },
    { label: "Question selection", value: assessment.question_selection },
    {
      label: "Time limit",
      value:
        assessment.time_limit_minutes != null
          ? `${assessment.time_limit_minutes} minutes`
          : "No limit",
    },
    { label: "Show results", value: assessment.show_results },
    { label: "Shuffle questions", value: assessment.shuffle_questions ? "Enabled" : "Disabled" },
    { label: "Allow going back", value: assessment.allow_going_back ? "Enabled" : "Disabled" },
    { label: "Share answers", value: assessment.is_allowed_share ? "Enabled" : "Disabled" },
    { label: "Show answers", value: assessment.is_showed_answers ? "Enabled" : "Disabled" },
  ];

  return (
    <Card className="border-border/70 bg-white/95 shadow-[0_18px_44px_rgba(20,53,43,0.08)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings2 className="h-4 w-4" />
          Assessment Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {settings.map((setting) => (
          <div
            key={setting.label}
            className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-muted/35 px-4 py-3"
          >
            <span className="text-sm text-inkd">{setting.label}</span>
            <span className="text-right text-sm font-semibold text-primary">{setting.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

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
        <Link
          href={`/assessments/${assessment.id}/results`}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-pl"
        >
          <BarChart3 className="h-4 w-4" />
          View Full Report
          <ArrowRight className="h-4 w-4" />
        </Link>
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
      <AssessmentSettings assessment={assessment} />
    </div>
  );
}
