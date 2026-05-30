"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Download, Edit3, Save, ShieldAlert } from "lucide-react";
import type { AnswerEntry, GradingStatus } from "@/src/types/answer-entry.types";
import type { AssessmentResultSheetPageData } from "@/src/types/assessment-results.types";
import { BackButton } from "@/src/components/ui/navigation/BackButton";
import { Badge } from "@/src/components/ui/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/ui/card";
import { exportResultSheetCsv } from "./results.export";

type EditableEntry = AnswerEntry & {
  review_mode: "read" | "edit";
};

function formatSubmittedAt(value: string | null) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
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

  return JSON.stringify(entry.response);
}

function formatCorrectAnswer(entry: AnswerEntry) {
  const value = entry.question_snapshot.correct_answer;
  if (value == null) return null;
  if (Array.isArray(value)) return value.map((item) => getOptionText(entry, item)).join(", ");
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "object") return JSON.stringify(value);
  if (typeof value === "string") return getOptionText(entry, value);
  return String(value);
}

function getGradingBadge(status: GradingStatus) {
  if (status === "PENDING") return <Badge variant="pending">Manual review</Badge>;
  if (status === "MANUAL_REVISED") return <Badge variant="warning">Manually reviewed</Badge>;
  if (status === "AI_EVALUATED") return <Badge variant="info">AI evaluated</Badge>;
  return <Badge variant="success">Automatic</Badge>;
}

export default function ResultSheetDetailView({
  data,
}: {
  data: AssessmentResultSheetPageData;
}) {
  const [entries, setEntries] = useState<EditableEntry[]>(
    data.answer_entries.map((entry) => ({
      ...entry,
      review_mode: "read",
    })),
  );

  const totalScore = useMemo(
    () => entries.reduce((sum, entry) => sum + (entry.score_awarded ?? 0), 0),
    [entries],
  );

  function updateEntry(
    entryId: string,
    patch: Partial<Pick<EditableEntry, "score_awarded" | "is_correct" | "grading_status" | "review_mode">>,
  ) {
    setEntries((current) =>
      current.map((entry) => (entry.id === entryId ? { ...entry, ...patch } : entry)),
    );
  }

  return (
    <div>
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={data.answer_sheet.status === "REVIEW_PENDING" ? "pending" : "success"}>
                {data.answer_sheet.status === "REVIEW_PENDING" ? "Pending manual review" : "Reviewed"}
              </Badge>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-primary">{data.participant.display_name}</h1>
            <p className="mt-2 text-sm text-inkd">{data.assessment.title}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => exportResultSheetCsv(data)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pl"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <BackButton
              href="/results"
              label="Back to results"
              className="rounded-lg px-4 py-2.5"
            />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Card>
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Answer sheet</p>
              <p className="mt-3 text-lg font-bold text-primary">{data.answer_sheet.id}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Total score</p>
              <p className="mt-3 text-lg font-bold text-primary">
                {totalScore}/{data.answer_sheet.max_score}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Grade</p>
              <p className="mt-3 text-lg font-bold text-primary">{data.answer_sheet.grade ?? "Pending"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Submitted</p>
              <p className="mt-3 text-sm font-semibold text-primary">
                {formatSubmittedAt(data.answer_sheet.submitted_at)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Questions</p>
              <p className="mt-3 text-lg font-bold text-primary">{data.questions.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 space-y-4">
          {entries.map((entry, index) => {
            const correctAnswer = formatCorrectAnswer(entry);
            const isEditable = entry.grading_status === "PENDING" || entry.grading_status === "MANUAL_REVISED";

            return (
              <Card key={entry.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                          {index + 1}
                        </span>
                        <span>{entry.question_snapshot.question_text}</span>
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {entry.question_snapshot.type_id} · {entry.question_snapshot.points} pts
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getGradingBadge(entry.grading_status)}
                      {isEditable && entry.review_mode === "read" ? (
                        <button
                          type="button"
                          onClick={() => updateEntry(entry.id, { review_mode: "edit" })}
                          className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-primary transition hover:bg-muted"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit review
                        </button>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-xl bg-muted/40 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Participant response</p>
                      <p className="mt-2 text-sm leading-6 text-primary">{formatResponse(entry)}</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Correct answer</p>
                      <p className="mt-2 text-sm leading-6 text-primary">{correctAnswer ?? "Not applicable for manual review"}</p>
                    </div>
                  </div>

                  {entry.review_mode === "edit" && isEditable ? (
                    <div className="grid gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-4 lg:grid-cols-3">
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Score awarded</span>
                        <input
                          type="number"
                          min={0}
                          max={entry.question_snapshot.points}
                          value={entry.score_awarded}
                          onChange={(event) =>
                            updateEntry(entry.id, {
                              score_awarded: Number(event.target.value),
                            })
                          }
                          className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary outline-none transition focus:border-primary"
                        />
                      </label>
                      <label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Correctness</span>
                        <select
                          value={entry.is_correct === null ? "null" : entry.is_correct ? "true" : "false"}
                          onChange={(event) =>
                            updateEntry(entry.id, {
                              is_correct:
                                event.target.value === "null" ? null : event.target.value === "true",
                            })
                          }
                          className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary outline-none transition focus:border-primary"
                        >
                          <option value="null">Not set</option>
                          <option value="true">Correct</option>
                          <option value="false">Incorrect</option>
                        </select>
                      </label>
                      <div className="flex items-end">
                        <button
                          type="button"
                          onClick={() =>
                            updateEntry(entry.id, {
                              grading_status: "MANUAL_REVISED",
                              review_mode: "read",
                            })
                          }
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pl"
                        >
                          <Save className="h-4 w-4" />
                          Save review
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 lg:grid-cols-3">
                      <div className="rounded-xl border border-border bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Score awarded</p>
                        <p className="mt-2 text-lg font-bold text-primary">{entry.score_awarded}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Is correct</p>
                        <p className="mt-2 text-lg font-bold text-primary">
                          {entry.is_correct == null ? "Not set" : entry.is_correct ? "Yes" : "No"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-white p-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Review status</p>
                        <div className="mt-2">
                          {entry.grading_status === "PENDING" ? (
                            <div className="inline-flex items-center gap-2 text-orange-700">
                              <ShieldAlert className="h-4 w-4" />
                              <span className="font-semibold">Awaiting manual review</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 text-green-700">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="font-semibold">{entry.grading_status}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
