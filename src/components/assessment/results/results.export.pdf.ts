import jsPDF from "jspdf";
import "jspdf-autotable";
import type {
  AssessmentResultSheetPageData,
} from "@/src/types/assessment-results.types";
import type { AnswerEntry } from "@/src/types/answer-entry.types";
import type { ResultsRow } from "./results.types";

// Primary brand color: #0F583E
const PRIMARY_COLOR: [number, number, number] = [15, 88, 62];
const SECONDARY_COLOR: [number, number, number] = [234, 244, 238]; // Very light green
const TEXT_COLOR: [number, number, number] = [50, 50, 50];

function sanitizeFilePart(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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
  return String(response.raw ?? "-");
}

function formatCorrectAnswer(entry: AnswerEntry) {
  const correct = entry.questionSnapshot.correctAnswers;
  if (!correct) return "-";
  let parsed: Record<string, unknown> = {};

  if (typeof correct === "string") {
    try {
      parsed = JSON.parse(correct);
    } catch {
      return correct;
    }
  } else {
    parsed = correct as Record<string, unknown>;
  }

  const type = String(entry.questionSnapshot.typeId ?? "").toLowerCase();

  if (type === "single") return getOptionText(entry, parsed.option_id);
  if (type === "multiple") {
    return Array.isArray(parsed.option_ids)
      ? parsed.option_ids.map((value) => getOptionText(entry, value)).join(", ")
      : "-";
  }
  if (type === "boolean") return parsed.value ? "True" : "False";
  if (type === "short" || type === "essay") {
    if (Array.isArray(parsed.acceptable_answers)) {
      return parsed.acceptable_answers.join(" OR ");
    }
    return "-";
  }
  if (type === "rating") return String(parsed.value ?? "-");
  if (type === "ordering") {
    return Array.isArray(parsed.ordered_ids)
      ? parsed.ordered_ids.map((value) => getOptionText(entry, value)).join(" -> ")
      : "-";
  }
  return "-";
}

// -------------------------------------------------------------------------
// PDF Generation
// -------------------------------------------------------------------------

export function exportResultsPdf(rows: ResultsRow[]) {
  const doc = new jsPDF({ orientation: "landscape" });

  // Document Header
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, doc.internal.pageSize.width, 30, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Assessment Service", 14, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Exported Results Report", doc.internal.pageSize.width - 14, 20, { align: "right" });

  const headers = [
    "Participant",
    "Assessment",
    "Session",
    "Score",
    "Max",
    "%",
    "Grade",
    "Outcome",
    "Eval Status",
    "Time Spent",
    "Submitted At",
  ];

  const body = rows.map((row) => [
    row.participantDisplayName,
    row.assessmentTitle,
    row.sessionInfo,
    row.answerSheetStatus === "IN_PROGRESS" ? "-" : row.totalScore,
    row.maxScore,
    row.answerSheetStatus === "IN_PROGRESS" ? "-" : row.percentage == null ? "Pending" : `${row.percentage}%`,
    row.answerSheetStatus === "IN_PROGRESS" ? "-" : row.grade ?? "Pending",
    row.answerSheetStatus === "IN_PROGRESS" ? "In Progress" : row.outcomeStatus,
    row.evaluationStatus,
    row.timeSpent,
    row.submittedAt,
  ]);

  // @ts-expect-error - jspdf-autotable extends jsPDF but types might complain
  doc.autoTable({
    startY: 40,
    head: [headers],
    body: body,
    theme: "grid",
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: 255,
      fontSize: 9,
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: TEXT_COLOR,
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: SECONDARY_COLOR,
    },
    margin: { top: 40, left: 14, right: 14, bottom: 20 },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didDrawPage: function (data: any) {
      // Footer
      // @ts-expect-error - jspdf-autotable types might complain
      const str = "Page " + doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        str,
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      );
    },
  });

  doc.save("results-export.pdf");
}

export function exportResultSheetPdf(data: AssessmentResultSheetPageData) {
  const doc = new jsPDF({ orientation: "portrait" });

  // Document Header Banner
  doc.setFillColor(...PRIMARY_COLOR);
  doc.rect(0, 0, doc.internal.pageSize.width, 35, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Result Sheet", 14, 22);

  // Metadata Section
  doc.setTextColor(...TEXT_COLOR);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  
  let currentY = 50;
  
  const addMetadata = (label: string, value: string | number | undefined, x: number) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, x, currentY);
    doc.setFont("helvetica", "normal");
    doc.text(String(value ?? "-"), x + 30, currentY);
  };

  addMetadata("Participant", data.participant.display_name, 14);
  addMetadata("Assessment", data.assessment.name || "Untitled", 110);
  currentY += 8;
  addMetadata("Sheet ID", data.answerSheet.id, 14);
  addMetadata("Status", data.answerSheet.status, 110);
  currentY += 8;
  
  const scoreText = data.answerSheet.totalScore == null ? "Pending review" : `${data.answerSheet.totalScore}/${data.answerSheet.maxScore}`;
  addMetadata("Total Score", scoreText, 14);
  addMetadata("Grade", data.answerSheet.grade ?? "Pending", 110);
  currentY += 8;
  addMetadata("Submitted At", data.answerSheet.submittedAt ?? "-", 14);
  addMetadata("Started At", data.answerSheet.startedAt ?? "-", 110);
  
  currentY += 15;

  const entries = Array.isArray(data.answerEntries) ? data.answerEntries : [];

  const headers = [
    "No.",
    "Question",
    "Participant Response",
    "Correct Answer",
    "Score",
    "Max",
    "Correct?",
  ];

  const body = entries.map((entry, index) => [
    index + 1,
    entry.questionSnapshot.questionText,
    formatResponse(entry),
    formatCorrectAnswer(entry),
    entry.scoreAwarded ?? "-",
    entry.questionSnapshot.points ?? "-",
    entry.isCorrect == null ? "Not set" : entry.isCorrect ? "Yes" : "No",
  ]);

  // @ts-expect-error - jspdf-autotable extends jsPDF but types might complain
  doc.autoTable({
    startY: currentY,
    head: [headers],
    body: body,
    theme: "grid",
    styles: {
      overflow: "linebreak",
      cellWidth: "wrap",
    },
    columnStyles: {
      1: { cellWidth: 50 }, // Question column
      2: { cellWidth: 45 }, // Response column
      3: { cellWidth: 45 }, // Correct Answer column
    },
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: 255,
      fontSize: 9,
      fontStyle: "bold",
    },
    bodyStyles: {
      textColor: TEXT_COLOR,
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: SECONDARY_COLOR,
    },
    margin: { top: 40, left: 14, right: 14, bottom: 20 },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    didDrawPage: function (data: any) {
      // Footer
      // @ts-expect-error - jspdf-autotable types might complain
      const str = "Page " + doc.internal.getNumberOfPages();
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        str,
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      );
    },
  });

  const filename = `result-${sanitizeFilePart(data.participant.display_name)}-${sanitizeFilePart(data.answerSheet.id)}.pdf`;
  doc.save(filename);
}
