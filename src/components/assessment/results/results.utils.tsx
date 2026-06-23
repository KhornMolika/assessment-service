import type { AssessmentResultsPageData } from "@/src/types/assessment-results.types";
import { Badge } from "@/src/components/ui/ui/badge";
import type { ResultsRow } from "./results.types";

export function getGradeTone(grade: string | null) {
  if (!grade) return "bg-slate-100 text-slate-700";
  if (grade.startsWith("A")) return "bg-green-100 text-green-700";
  if (grade.startsWith("B")) return "bg-blue-100 text-blue-700";
  if (grade.startsWith("C")) return "bg-yellow-100 text-yellow-700";
  if (grade.startsWith("D")) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
}

export function getOutcomeBadge(status: "PASSED" | "FAILED" | "PENDING_REVIEW") {
  if (status === "PASSED") return <Badge variant="success">Passed</Badge>;
  if (status === "FAILED") return <Badge variant="warning">Failed</Badge>;
  return <Badge variant="pending">Pending review</Badge>;
}

export function buildRows(data: AssessmentResultsPageData): ResultsRow[] {
  return data.answer_sheets.map((sheet) => {
    const participant = data.participants.find((item) => item.id === sheet.participant_id);
    const assessment = data.assessments.find((item) => item.id === sheet.assessment_id);
    const entries = data.answer_entries.filter((entry) => entry.sheet_id === sheet.id);
    const hasPendingEntry = entries.some((entry) => entry.grading_status === "PENDING");
    const percentage =
      sheet.total_score != null && sheet.max_score > 0
        ? Math.round((sheet.total_score / sheet.max_score) * 100)
        : null;
    const evaluationStatus =
      sheet.status === "REVIEW_PENDING" || hasPendingEntry ? "PENDING_REVIEW" : "FINAL";

    return {
      sheet_id: sheet.id,
      assessment_id: sheet.assessment_id,
      participant_id: sheet.participant_id,
      participant_display_name: participant?.display_name ?? "Unknown participant",
      assessment_title: assessment?.title ?? "Unknown assessment",
      answer_sheet_status: sheet.status,
      total_score: sheet.total_score,
      max_score: sheet.max_score,
      percentage,
      grade: sheet.grade,
      outcomeStatus:
        evaluationStatus === "PENDING_REVIEW"
          ? "PENDING_REVIEW"
          : sheet.is_passed
            ? "PASSED"
            : "FAILED",
      evaluationStatus,
      timeSpent: sheet.submitted_at != null ? formatDuration(sheet.started_at, sheet.submitted_at) : "-",
      submittedAt:
        sheet.submitted_at != null
          ? new Intl.DateTimeFormat("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }).format(new Date(sheet.submitted_at))
          : "-",
      sessionInfo:
        assessment?.id === "assessment-3" || assessment?.id === "assessment-8"
          ? `session/${sheet.id.slice(-1)}`
          : `sheet/${sheet.id.slice(-1)}`,
    };
  });
}

function formatDuration(startedAt: string, submittedAt: string) {
  const diffMinutes = Math.max(
    1,
    Math.round((new Date(submittedAt).getTime() - new Date(startedAt).getTime()) / 60000),
  );

  return `${diffMinutes} min`;
}
