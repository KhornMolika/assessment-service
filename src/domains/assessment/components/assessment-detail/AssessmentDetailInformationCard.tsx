import { BarChart3, Clock, FileText, PlayCircle } from "lucide-react";
import type { AssessmentDetailRecord } from "@/src/domains/assessment/types/assessment-detail.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/shared/components/ui/card";

function formatDeliveryMode(value: AssessmentDetailRecord["delivery_mode"]) {
  return value === "SELF_PACED" ? "Self-paced" : "Real-time";
}

const infoRows = [
  { label: "Status", field: "lifecycle" },
  { label: "Source Bank", field: "source_bank" },
  { label: "Question Selection", field: "question_selection" },
  { label: "Shuffle Questions", field: "shuffle_questions" },
  { label: "Allow Going Back", field: "allow_going_back" },
  { label: "Pass Mark", field: "pass_mark" },
  { label: "Show Results", field: "show_results" },
  { label: "Total Points", field: "total_points" },
  { label: "Created By", field: "created_by" },
] as const;

function formatValue(
  assessment: AssessmentDetailRecord,
  field: (typeof infoRows)[number]["field"],
) {
  const value = assessment[field];

  if (field === "lifecycle" && typeof value === "string") {
    return value.charAt(0) + value.slice(1).toLowerCase();
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (field === "pass_mark") {
    return `${value}%`;
  }

  return `${value}`;
}

export default function AssessmentDetailInformationCard({
  assessment,
}: {
  assessment: AssessmentDetailRecord;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <FileText className="h-5 w-5" />
          Assessment Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <div className="mb-1 text-sm text-inkd">Assessment Mode</div>
            <div className="flex items-center gap-2 text-primary">
              <PlayCircle className="h-5 w-5" />
              <span className="text-lg font-bold">{formatDeliveryMode(assessment.delivery_mode)}</span>
            </div>
          </div>

          <div>
            <div className="mb-1 text-sm text-inkd">Total Questions</div>
            <div className="flex items-center gap-2 text-primary">
              <BarChart3 className="h-5 w-5" />
              <span className="text-lg font-bold">{assessment.question_count}</span>
            </div>
          </div>

          <div>
            <div className="mb-1 text-sm text-inkd">Time Limit</div>
            <div className="flex items-center gap-2 text-primary">
              <Clock className="h-5 w-5" />
              <span className="font-semibold">{assessment.time_limit_minutes} minutes</span>
            </div>
          </div>

          {infoRows.map(({ label, field }) => (
            <div key={field}>
              <div className="mb-1 text-sm text-inkd">{label}</div>
              <div className="font-semibold text-primary">{formatValue(assessment, field)}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-border/70 pt-6">
          <div className="mb-3 text-sm text-inkd">Grade Scale</div>
          <div className="flex flex-wrap gap-2">
            {assessment.grade_scale.map((grade) => (
              <div key={grade.grade} className="rounded-lg border border-border bg-accl/40 px-3 py-2">
                <span className="font-bold text-primary">{grade.grade}</span>
                <span className="ml-1 text-xs text-inkd">{">="} {grade.minPercent}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
