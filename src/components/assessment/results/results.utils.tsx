import type { AssessmentResultsPageData } from "@/src/types/assessment-results.types";
import { Badge } from "@/src/components/ui/ui/badge";
import type { ResultsRow } from "./results.types";

export function getGradeTone(grade: string | null) {
  if (!grade) return "bg-slate-100 text-slate-700";
  const normalizedGrade = grade.toLowerCase();
  if (normalizedGrade === "pass" || normalizedGrade === "passed") {
    return "bg-green-100 text-green-700";
  }
  if (normalizedGrade === "fail" || normalizedGrade === "failed") {
    return "bg-red-100 text-red-700";
  }
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
  return data.answerSheets.map((sheet) => {
    const participant = data.participants.find((item) => item.id === sheet.participantId);
    const assessment = data.assessments.find((item) => item.id === sheet.assessmentId);
    const entries = data.answerEntries.filter((entry) => entry.sheetId === sheet.id);
    const hasPendingEntry = entries.some((entry) => entry.gradingStatus === "PENDING");
    const percentage =
      sheet.totalScore != null && sheet.maxScore > 0
        ? Math.round((sheet.totalScore / sheet.maxScore) * 100)
        : null;
    const evaluationStatus =
      sheet.status === "REVIEW_PENDING" || hasPendingEntry ? "PENDING_REVIEW" : "FINAL";

    return {
      sheetId: sheet.id,
      assessmentId: sheet.assessmentId,
      participantId: sheet.participantId,
      participantDisplayName: participant?.display_name ?? "Unknown participant",
      assessmentTitle: assessment?.name ?? "Unknown assessment",
      answerSheetStatus: sheet.status,
      totalScore: sheet.totalScore,
      maxScore: sheet.maxScore,
      percentage,
      grade: sheet.grade,
      outcomeStatus:
        evaluationStatus === "PENDING_REVIEW"
          ? "PENDING_REVIEW"
          : sheet.isPassed
            ? "PASSED"
            : "FAILED",
      evaluationStatus,
      timeSpent: sheet.submittedAt != null ? formatDuration(sheet.startedAt, sheet.submittedAt) : "-",
      submittedAt:
        sheet.submittedAt != null
          ? new Intl.DateTimeFormat("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }).format(new Date(sheet.submittedAt))
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
