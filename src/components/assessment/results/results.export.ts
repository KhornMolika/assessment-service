import type {
  AssessmentResultSheetPageData,
  AssessmentResultsPageData,
} from "@/src/types/assessment-results.types";
import type { AnswerEntry } from "@/src/types/answer-entry.types";
import type { ResultsRow } from "./results.types";

function sanitizeFilePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeCsv(value: string | number | null) {
  if (value == null) return "";
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function buildCsv(rows: ResultsRow[]) {
  const headers = [
    "Participant",
    "Assessment",
    "Session",
    "Answer Sheet",
    "Score",
    "Max Score",
    "Percentage",
    "Grade",
    "Outcome Status",
    "Evaluation Status",
    "Time Spent",
    "Submitted At",
  ];

  const records = rows.map((row) => [
    row.participantDisplayName,
    row.assessmentTitle,
    row.sessionInfo,
    row.sheetId,
    row.totalScore,
    row.maxScore,
    row.percentage == null ? "Pending review" : `${row.percentage}%`,
    row.grade ?? "Pending",
    row.outcomeStatus,
    row.evaluationStatus,
    row.timeSpent,
    row.submittedAt,
  ]);

  return [headers, ...records].map((record) => record.map(escapeCsv).join(",")).join("\n");
}

function parseResponseValue(entry: AnswerEntry) {
  if (typeof entry.response === "string") {
    try {
      return JSON.parse(entry.response) as Record<string, unknown>;
    } catch {
      return { raw: entry.response } as Record<string, unknown>;
    }
  }

  return entry.response as Record<string, unknown>;
}

function getOptionText(entry: AnswerEntry, optionId: unknown) {
  const id = String(optionId ?? "");
  return entry.questionSnapshot.options?.find((option) => option.id === id)?.text ?? id;
}

function formatResponse(entry: AnswerEntry) {
  const response = parseResponseValue(entry);
  const type = String(response.type ?? "").toLowerCase();

  if (type === "single") return getOptionText(entry, response.selected_option_id);
  if (type === "multiple") {
    return Array.isArray(response.selected_option_ids)
      ? response.selected_option_ids.map((value) => getOptionText(entry, value)).join(", ")
      : "-";
  }
  if (type === "boolean") return response.value ? "True" : "False";
  if (type === "short" || type === "essay") return String(response.text ?? "-");
  if (type === "rating") return String(response.value ?? "-");
  if (type === "ordering") {
    return Array.isArray(response.ordered_ids)
      ? response.ordered_ids.map((value) => getOptionText(entry, value)).join(" -> ")
      : "-";
  }
  if (type === "fill") return Array.isArray(response.answers) ? response.answers.join(", ") : "-";
  if (type === "matching") {
    return Array.isArray(response.pairs)
      ? response.pairs
          .map(
            (pair) =>
              `${getOptionText(entry, (pair as { left_id?: string }).left_id)} -> ${getOptionText(entry, (pair as { right_id?: string }).right_id)}`,
          )
          .join(", ")
      : "-";
  }
  if (type === "file") return String(response.file_url ?? "-");
  if ("raw" in response) return String(response.raw ?? "-");

  return JSON.stringify(response);
}

function formatCorrectAnswer(entry: AnswerEntry) {
  const value = entry.questionSnapshot.correctAnswers;
  if (value == null) return "Not applicable";
  if (Array.isArray(value)) return value.map((item) => getOptionText(entry, item)).join(", ");
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "string") return getOptionText(entry, value);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function buildParticipantResultCsv(data: AssessmentResultsPageData, row: ResultsRow) {
  const participant = data.participants.find((item) => item.id === row.participantId);
  const assessment = data.assessments.find((item) => item.id === row.assessmentId);
  const sheet = data.answerSheets.find((item) => item.id === row.sheetId);
  const entries = data.answerEntries.filter((entry) => entry.sheetId === row.sheetId);

  const summaryRows = [
    ["Participant", participant?.display_name ?? row.participantDisplayName],
    ["Assessment", assessment?.name ?? row.assessmentTitle],
    ["Answer Sheet", row.sheetId],
    ["Status", row.answerSheetStatus],
    ["Evaluation", row.evaluationStatus],
    ["Outcome", row.outcomeStatus],
    ["Score", row.totalScore == null ? "Pending review" : `${row.totalScore}/${row.maxScore}`],
    ["Grade", row.grade ?? "Pending"],
    ["Submitted At", row.submittedAt],
    ["Time Spent", row.timeSpent],
    ["Joined At", participant?.joined_at ?? "-"],
    ["Started At", sheet?.startedAt ?? "-"],
    ["Share Token", sheet?.shareToken ?? "-"],
    [],
    [
      "No.",
      "Question",
      "Type",
      "Participant Response",
      "Correct Answer",
      "Score Awarded",
      "Max Points",
      "Is Correct",
      "Grading Status",
      "Updated At",
    ],
    ...entries.map((entry, index) => [
      index + 1,
      entry.questionSnapshot.questionText,
      entry.questionSnapshot.typeId,
      formatResponse(entry),
      formatCorrectAnswer(entry),
      entry.scoreAwarded,
      entry.questionSnapshot.points,
      entry.isCorrect == null ? "Not set" : entry.isCorrect ? "Yes" : "No",
      entry.gradingStatus,
      entry.updatedAt,
    ]),
  ];

  return summaryRows.map((record) => record.map((value) => escapeCsv(value ?? null)).join(",")).join("\n");
}

function buildResultSheetCsv(data: AssessmentResultSheetPageData) {
  const summaryRows = [
    ["Participant", data.participant.display_name],
    ["Assessment", data.assessment.name || "Untitled"],
    ["Answer Sheet", data.answerSheet.id],
    ["Status", data.answerSheet.status],
    ["Score", data.answerSheet.totalScore == null ? "Pending review" : `${data.answerSheet.totalScore}/${data.answerSheet.maxScore}`],
    ["Grade", data.answerSheet.grade ?? "Pending"],
    ["Submitted At", data.answerSheet.submittedAt ?? "-"],
    ["Joined At", data.participant.joined_at],
    ["Started At", data.answerSheet.startedAt],
    ["Share Token", data.answerSheet.shareToken],
    [],
    [
      "No.",
      "Question",
      "Type",
      "Participant Response",
      "Correct Answer",
      "Score Awarded",
      "Max Points",
      "Is Correct",
      "Grading Status",
      "Updated At",
    ],
    ...data.answerEntries.map((entry, index) => [
      index + 1,
      entry.questionSnapshot.questionText,
      entry.questionSnapshot.typeId,
      formatResponse(entry),
      formatCorrectAnswer(entry),
      entry.scoreAwarded,
      entry.questionSnapshot.points,
      entry.isCorrect == null ? "Not set" : entry.isCorrect ? "Yes" : "No",
      entry.gradingStatus,
      entry.updatedAt,
    ]),
  ];

  return summaryRows.map((record) => record.map((value) => escapeCsv(value ?? null)).join(",")).join("\n");
}

export function exportResultsCsv(rows: ResultsRow[]) {
  const csv = buildCsv(rows);
  downloadBlob("results-export.csv", new Blob([csv], { type: "text/csv;charset=utf-8;" }));
}

export function exportSingleResultCsv(data: AssessmentResultsPageData, row: ResultsRow) {
  const csv = buildParticipantResultCsv(data, row);
  const filename = `result-${sanitizeFilePart(row.participantDisplayName)}-${sanitizeFilePart(row.sheetId)}.csv`;
  downloadBlob(filename, new Blob([csv], { type: "text/csv;charset=utf-8;" }));
}

export function exportResultSheetCsv(data: AssessmentResultSheetPageData) {
  const csv = buildResultSheetCsv(data);
  const filename = `result-${sanitizeFilePart(data.participant.display_name)}-${sanitizeFilePart(data.answerSheet.id)}.csv`;
  downloadBlob(filename, new Blob([csv], { type: "text/csv;charset=utf-8;" }));
}
