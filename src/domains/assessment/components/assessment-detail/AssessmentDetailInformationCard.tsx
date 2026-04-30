import { BarChart3, Clock, FileText, PlayCircle, Settings2 } from "lucide-react";
import type { AssessmentDetailRecord } from "@/src/domains/assessment/types/assessment-detail.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/shared/components/ui/card";

function formatDeliveryMode(value: AssessmentDetailRecord["delivery_mode"]) {
  return value === "SELF_PACED" ? "Self-paced" : "Real-time";
}

const assessmentRows = [
  { label: "Status", field: "status" },
  { label: "Active", field: "is_active" },
  { label: "Created At", field: "created_at" },
  { label: "Updated At", field: "updated_at" },
] as const;

const settingsRows = [
  { label: "Mode", field: "delivery_mode" },
  { label: "Question Selection", field: "question_selection" },
  { label: "Fixed Questions Count", field: "question_count" },
  { label: "Selection Rules", field: "selection_rules" },
  { label: "Time Limit", field: "time_limit_minutes" },
  { label: "Starts At", field: "starts_at" },
  { label: "Ends At", field: "ends_at" },
  { label: "Pass Mark", field: "pass_mark" },
  { label: "Shuffle Questions", field: "shuffle_questions" },
  { label: "Allow Going Back", field: "allow_going_back" },
  { label: "Result Release", field: "show_results" },
  { label: "Max Attempts", field: "max_attempts" },
  { label: "Grade Labels", field: "grade_scale" },
  { label: "Allow Share", field: "is_allowed_share" },
  { label: "Participant Identity", field: "participant_identity" },
  { label: "Settings Updated At", field: "updated_at" },
] as const;

type DetailField =
  | (typeof assessmentRows)[number]["field"]
  | (typeof settingsRows)[number]["field"];

function formatValue(
  assessment: AssessmentDetailRecord,
  field: DetailField,
) {
  const value =
    field === "is_active"
      ? assessment.status === "PUBLISHED" && assessment.lifecycle !== "COMPLETED"
      : field === "selection_rules"
        ? "Easy 8, Medium 10, Hard 5"
        : field === "ends_at"
          ? null
          : field === "max_attempts"
            ? 1
            : assessment[field];

  if (
    (
      field === "status" ||
      field === "participant_identity" ||
      field === "delivery_mode" ||
      field === "question_selection"
    ) &&
    typeof value === "string"
  ) {
    return value
      .split("_")
      .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
      .join(" ");
  }

  if (typeof value === "boolean") {
    return value ? "Enabled" : "Disabled";
  }

  if (field === "pass_mark") {
    return `${value}%`;
  }

  if ((field === "created_at" || field === "updated_at" || field === "starts_at") && typeof value === "string") {
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(value));
  }

  if (field === "time_limit_minutes") {
    return value != null ? `${value} minutes` : "No limit";
  }

  if (field === "grade_scale") {
    return assessment.grade_scale
      .map((grade) => `${grade.grade} >= ${grade.minPercent}%`)
      .join(", ");
  }

  if (value == null || value === "") {
    return "Not set";
  }

  return `${value}`;
}

function getParticipantIdentityNote(identity: AssessmentDetailRecord["participant_identity"]) {
  switch (identity) {
    case "ANONYMOUS":
      return "Anonymous participants skip name entry.";
    case "INTERNAL":
      return "Internal participants enter email and phone number before starting.";
    case "EXTERNAL":
      return "External participants enter a display name before starting.";
  }
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/30 px-4 py-3">
      <div className="mb-1 text-xs font-medium uppercase tracking-[0.14em] text-inkd">{label}</div>
      <div className="break-words text-sm font-semibold text-primary">{value}</div>
    </div>
  );
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
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
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
              <span className="font-semibold">
                {assessment.time_limit_minutes != null
                  ? `${assessment.time_limit_minutes} minutes`
                  : "No limit"}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-border/70 pt-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
            <FileText className="h-4 w-4" />
            assessments
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {assessmentRows.map(({ label, field }) => (
              <DetailRow
                key={field}
                label={label}
                value={formatValue(assessment, field)}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-border/70 pt-6">
          <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
            <Settings2 className="h-4 w-4" />
            assessment_settings
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {settingsRows.map(({ label, field }) => (
              <DetailRow
                key={field}
                label={label}
                value={formatValue(assessment, field)}
              />
            ))}
          </div>
          <div className="mt-3 rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm font-medium text-primary">
            {getParticipantIdentityNote(assessment.participant_identity)}
          </div>
        </div>

        <div className="border-t border-border/70 pt-6">
          <div className="mb-3 text-sm text-inkd">Grade Labels</div>
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
