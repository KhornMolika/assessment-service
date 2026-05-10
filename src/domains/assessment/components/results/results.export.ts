import type {
  AssessmentResultSheetPageData,
  AssessmentResultsPageData,
} from "@/src/domains/assessment/types/assessment-results.types";
import type { AnswerEntry } from "@/src/domains/assessment/types/answer-entry.types";
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
    row.participant_display_name,
    row.assessment_title,
    row.sessionInfo,
    row.sheet_id,
    row.total_score,
    row.max_score,
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
  return entry.question_snapshot.options?.find((option) => option.id === id)?.text ?? id;
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
  const value = entry.question_snapshot.correct_answer;
  if (value == null) return "Not applicable";
  if (Array.isArray(value)) return value.map((item) => getOptionText(entry, item)).join(", ");
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "string") return getOptionText(entry, value);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function buildParticipantResultCsv(data: AssessmentResultsPageData, row: ResultsRow) {
  const participant = data.participants.find((item) => item.id === row.participant_id);
  const assessment = data.assessments.find((item) => item.id === row.assessment_id);
  const sheet = data.answer_sheets.find((item) => item.id === row.sheet_id);
  const entries = data.answer_entries.filter((entry) => entry.sheet_id === row.sheet_id);

  const summaryRows = [
    ["Participant", participant?.display_name ?? row.participant_display_name],
    ["Assessment", assessment?.title ?? row.assessment_title],
    ["Answer Sheet", row.sheet_id],
    ["Status", row.answer_sheet_status],
    ["Evaluation", row.evaluationStatus],
    ["Outcome", row.outcomeStatus],
    ["Score", row.total_score == null ? "Pending review" : `${row.total_score}/${row.max_score}`],
    ["Grade", row.grade ?? "Pending"],
    ["Submitted At", row.submittedAt],
    ["Time Spent", row.timeSpent],
    ["Joined At", participant?.joined_at ?? "-"],
    ["Started At", sheet?.started_at ?? "-"],
    ["Share Token", sheet?.share_token ?? "-"],
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
      entry.question_snapshot.question_text,
      entry.question_snapshot.type_id,
      formatResponse(entry),
      formatCorrectAnswer(entry),
      entry.score_awarded,
      entry.question_snapshot.points,
      entry.is_correct == null ? "Not set" : entry.is_correct ? "Yes" : "No",
      entry.grading_status,
      entry.updated_at,
    ]),
  ];

  return summaryRows.map((record) => record.map((value) => escapeCsv(value ?? null)).join(",")).join("\n");
}

function buildResultSheetCsv(data: AssessmentResultSheetPageData) {
  const summaryRows = [
    ["Participant", data.participant.display_name],
    ["Assessment", data.assessment.title],
    ["Answer Sheet", data.answer_sheet.id],
    ["Status", data.answer_sheet.status],
    ["Score", data.answer_sheet.total_score == null ? "Pending review" : `${data.answer_sheet.total_score}/${data.answer_sheet.max_score}`],
    ["Grade", data.answer_sheet.grade ?? "Pending"],
    ["Submitted At", data.answer_sheet.submitted_at ?? "-"],
    ["Joined At", data.participant.joined_at],
    ["Started At", data.answer_sheet.started_at],
    ["Share Token", data.answer_sheet.share_token],
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
    ...data.answer_entries.map((entry, index) => [
      index + 1,
      entry.question_snapshot.question_text,
      entry.question_snapshot.type_id,
      formatResponse(entry),
      formatCorrectAnswer(entry),
      entry.score_awarded,
      entry.question_snapshot.points,
      entry.is_correct == null ? "Not set" : entry.is_correct ? "Yes" : "No",
      entry.grading_status,
      entry.updated_at,
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
  const filename = `result-${sanitizeFilePart(row.participant_display_name)}-${sanitizeFilePart(row.sheet_id)}.csv`;
  downloadBlob(filename, new Blob([csv], { type: "text/csv;charset=utf-8;" }));
}

export function exportResultSheetCsv(data: AssessmentResultSheetPageData) {
  const csv = buildResultSheetCsv(data);
  const filename = `result-${sanitizeFilePart(data.participant.display_name)}-${sanitizeFilePart(data.answer_sheet.id)}.csv`;
  downloadBlob(filename, new Blob([csv], { type: "text/csv;charset=utf-8;" }));
}
