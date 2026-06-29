"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download, Edit3, Save, ShieldAlert, Sparkles, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import type { AnswerEntry, GradingStatus } from "@/src/types/answer-entry.types";
import type { AssessmentResultSheetPageData } from "@/src/types/assessment-results.types";
import { BackButton } from "@/src/components/ui/navigation/BackButton";
import { Badge } from "@/src/components/ui/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/ui/card";
import { exportResultSheetCsv } from "./results.export";
import { retryAIGrading } from "@/src/api/assessment.api";
import { getAnswerResponseText, getCorrectAnswerText } from "@/src/lib/session/session.utils";
import { Button } from "@/src/components/ui/ui/button";
import { Label } from "@/src/components/ui/ui/label";
import { Select } from "@/src/components/ui/ui/select";
import { Input } from "@/src/components/ui/ui/input";
import { recalculateResultAction, saveManualReviewAction } from "@/src/lib/actions/result-review.actions";
import { Modal } from "@/src/components/ui/ui/modal";

type EditableEntry = AnswerEntry & {
  reviewMode: "read" | "edit";
};

type RecalculateFeedback = {
  status: "success" | "error";
  title: string;
  message: string;
};

type ResultSummary = {
  totalScore: number | null;
  maxScore: number;
  grade: string | null;
  isPassed: boolean | null;
  status: "IN_PROGRESS" | "SUBMITTED" | "REVIEW_PENDING" | "REVIEWED";
};

function mapSheetStatus(status: string | undefined) {
  if (status === "GRADED") return "REVIEWED";
  if (status === "REQUIRES_REVIEW") return "REVIEW_PENDING";
  if (status === "SUBMITTED") return "SUBMITTED";
  return "IN_PROGRESS";
}

function clampScore(value: number, maxScore: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.min(Math.max(value, 0), Math.max(maxScore, 0));
}

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
      const parsed = JSON.parse(entry.response);
      if (typeof parsed === "number" && entry.questionSnapshot.typeId === "SINGLE_CHOICE") {
        return String(parsed);
      }
      return parsed;
    } catch {
      return entry.response;
    }
  }
  return entry.response;
}

function toQuestionRound(entry: AnswerEntry) {
  return {
    id: entry.questionId,
    type: entry.questionSnapshot.typeId,
    question: entry.questionSnapshot.questionText,
    options: Array.isArray(entry.questionSnapshot.options) ? entry.questionSnapshot.options : [],
    rawOptions: entry.questionSnapshot.options,
    correctAnswers: entry.questionSnapshot.correctAnswers,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    correctOptionId: (entry.questionSnapshot.correctAnswers as any)?.optionId,
    points: entry.questionSnapshot.points,
  } as unknown as import("@/src/types/session.types").QuestionRound;
}

function formatResponse(entry: AnswerEntry) {
  const round = toQuestionRound(entry);
  const val = parseResponseValue(entry);
  const text = getAnswerResponseText(round, val);
  return text || <span className="italic opacity-50">No answer provided</span>;
}

function formatCorrectAnswer(entry: AnswerEntry) {
  const round = toQuestionRound(entry);
  const text = getCorrectAnswerText(round);
  return text || <span className="italic opacity-50">Not applicable for manual review</span>;
}

function getGradingBadge(status: GradingStatus) {
  if (status === "PENDING") return <Badge variant="pending">Manual review</Badge>;
  if (status === "MANUAL_REVISED") return <Badge variant="warning">Manually reviewed</Badge>;
  if (status === "AI_EVALUATED") return <Badge variant="info">AI evaluated</Badge>;
  return <Badge variant="success">Automatic</Badge>;
}

export default function ResultSheetDetailView({
  data,
  backHref,
}: {
  data: AssessmentResultSheetPageData;
  backHref?: string;
}) {
  const router = useRouter();
  const resolvedBackHref = backHref ?? `/assessments/${data.answerSheet.assessmentId}/reports`;
  const [entries, setEntries] = useState<EditableEntry[]>(
    data.answerEntries.map((entry) => ({
      ...entry,
      reviewMode: "read",
    })),
  );
  const [retryingIds, setRetryingIds] = useState<Record<string, boolean>>({});
  const [savingIds, setSavingIds] = useState<Record<string, boolean>>({});
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalculateFeedback, setRecalculateFeedback] =
    useState<RecalculateFeedback | null>(null);
  const [summary, setSummary] = useState<ResultSummary>({
    totalScore: data.answerSheet.totalScore,
    maxScore: data.answerSheet.maxScore,
    grade: data.answerSheet.grade,
    isPassed: data.answerSheet.isPassed,
    status: data.answerSheet.status,
  });

  async function handleRetry(entryId: string) {
    setRetryingIds((prev) => ({ ...prev, [entryId]: true }));
    try {
      const success = await retryAIGrading(data.assessment.id, data.answerSheet.id, entryId);
      if (success) {
        alert("AI Grading retry queued. Please refresh shortly.");
      } else {
        alert("Failed to queue AI grading retry.");
      }
    } finally {
      setRetryingIds((prev) => ({ ...prev, [entryId]: false }));
    }
  }

  const totalScore = useMemo(
    () => entries.reduce((sum, entry) => sum + (entry.scoreAwarded ?? 0), 0),
    [entries],
  );

  function updateEntry(
    entryId: string,
    patch: Partial<Pick<EditableEntry, "scoreAwarded" | "isCorrect" | "gradingStatus" | "reviewMode">>,
  ) {
    setEntries((current) =>
      current.map((entry) => (entry.id === entryId ? { ...entry, ...patch } : entry)),
    );
  }

  function updateEntryCorrectness(entry: EditableEntry, value: string) {
    const maxScore = Number(entry.questionSnapshot.points ?? 0);

    if (value === "true") {
      updateEntry(entry.id, {
        isCorrect: true,
        scoreAwarded:
          entry.scoreAwarded && entry.scoreAwarded > 0
            ? clampScore(Number(entry.scoreAwarded), maxScore)
            : maxScore,
      });
      return;
    }

    updateEntry(entry.id, {
      isCorrect: value === "false" ? false : null,
      scoreAwarded: 0,
    });
  }

  function openReviewEditor(entry: EditableEntry) {
    const scoreAwarded = Number(entry.scoreAwarded ?? 0);
    updateEntry(entry.id, {
      reviewMode: "edit",
      isCorrect:
        entry.gradingStatus === "PENDING"
          ? entry.isCorrect
          : scoreAwarded > 0,
      scoreAwarded: clampScore(
        scoreAwarded,
        Number(entry.questionSnapshot.points ?? 0),
      ),
    });
  }

  async function handleSaveReview(entry: EditableEntry) {
    setSavingIds((prev) => ({ ...prev, [entry.id]: true }));
    const res = await saveManualReviewAction(
      data.answerSheet.id,
      entry.id,
      Number(entry.scoreAwarded ?? 0),
    );

    if (!res.success) {
      alert(res.error || "Failed to save review.");
      setSavingIds((prev) => ({ ...prev, [entry.id]: false }));
      return;
    }

    updateEntry(entry.id, {
      gradingStatus: "MANUAL_REVISED",
      reviewMode: "read",
    });
    setSavingIds((prev) => ({ ...prev, [entry.id]: false }));
    router.refresh();
  }

  async function handleRecalculate() {
    setIsRecalculating(true);
    const res = await recalculateResultAction(data.answerSheet.id);

    if (!res.success) {
      setIsRecalculating(false);
      setRecalculateFeedback({
        status: "error",
        title: "Recalculate failed",
        message: res.error || "Failed to recalculate result.",
      });
      return;
    }

    setIsRecalculating(false);
    const recalculated = res.data;
    if (recalculated) {
      setSummary({
        totalScore: recalculated.totalScore ?? summary.totalScore,
        maxScore: recalculated.maxScore ?? summary.maxScore,
        grade: recalculated.grade ?? summary.grade,
        isPassed: recalculated.isPassed ?? summary.isPassed,
        status: mapSheetStatus(recalculated.status) ?? summary.status,
      });
    }
    setRecalculateFeedback({
      status: "success",
      title: "Result recalculated",
      message: `The total score, grade, and review status have been updated.${recalculated?.grade ? ` New grade: ${recalculated.grade}.` : ""}`,
    });
  }

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={summary.status === "REVIEW_PENDING" ? "pending" : "success"}>
                {summary.status === "REVIEW_PENDING" ? "Pending manual review" : "Reviewed"}
              </Badge>
            </div>
            <h1 className="mt-4 text-3xl font-bold text-primary">{data.participant.display_name}</h1>
            <p className="mt-2 text-sm text-inkd">{data.assessment.name || "Untitled"}</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              onClick={() => exportResultSheetCsv(data)}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pl"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <BackButton
              href={resolvedBackHref}
              label="Back to results"
              className="rounded-lg px-4 py-2.5"
            />
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Answer sheet</p>
              <p className="mt-2 truncate text-sm font-bold text-primary">{data.answerSheet.id}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Total score</p>
              <p className="mt-2 text-lg font-bold text-primary">
                {summary.totalScore ?? totalScore}/{summary.maxScore}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Grade</p>
              <p className="mt-2 text-lg font-bold text-primary">{summary.grade ?? "Pending"}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Submitted</p>
              <p className="mt-2 text-sm font-semibold text-primary">
                {formatSubmittedAt(data.answerSheet.submittedAt)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Questions</p>
              <p className="mt-2 text-lg font-bold text-primary">{data.questions.length}</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-5 space-y-3">
          {entries.map((entry, index) => {
            const correctAnswer = formatCorrectAnswer(entry);
            const isEditable = entry.gradingStatus === "PENDING" || entry.gradingStatus === "MANUAL_REVISED";
            const maxEntryScore = Number(entry.questionSnapshot.points ?? 0);
            const canEditScore = entry.reviewMode === "edit" && entry.isCorrect === true;
            const canSaveReview = entry.reviewMode === "edit" && entry.isCorrect !== null && !savingIds[entry.id];

            return (
              <Card key={entry.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                          {index + 1}
                        </span>
                        <span>{entry.questionSnapshot.questionText}</span>
                      </CardTitle>
                      <CardDescription className="mt-1.5">
                        {entry.questionSnapshot.typeId} · {entry.questionSnapshot.points} pts
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getGradingBadge(entry.gradingStatus)}
                      {entry.aiGrading && entry.reviewMode === "read" ? (
                        <Button
                          type="button"
                          onClick={() => handleRetry(entry.id)}
                          disabled={retryingIds[entry.id]}
                          className="inline-flex items-center gap-2 rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-semibold text-purple-700 transition hover:bg-purple-100 disabled:opacity-50" variant="ghost"
                        >
                          <RefreshCw className={`h-4 w-4 ${retryingIds[entry.id] ? "animate-spin" : ""}`} />
                          {retryingIds[entry.id] ? "Retrying..." : "Retry AI"}
                        </Button>
                      ) : null}
                      {isEditable && entry.reviewMode === "read" ? (
                        <Button
                          type="button"
                          onClick={() => openReviewEditor(entry)}
                          className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 text-sm font-semibold text-primary transition hover:bg-muted" variant="secondary"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit review
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 p-4 pt-0">
                  <div className="grid gap-3 lg:grid-cols-2">
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Participant response</p>
                      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-primary">{formatResponse(entry)}</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Correct answer</p>
                      <p className="mt-1.5 text-sm leading-6 text-primary">{correctAnswer ?? "Not applicable for manual review"}</p>
                    </div>
                  </div>

                  {entry.aiGrading && (
                    <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm">
                      <div className="flex items-center gap-2 text-purple-700">
                        <Sparkles className="h-5 w-5" />
                        <h4 className="font-bold">AI Evaluation Insights</h4>
                        {entry.aiGrading.flagForReview && (
                          <Badge variant="pending" className="ml-2">Flagged for manual review</Badge>
                        )}
                      </div>
                      <div className="mt-3 grid gap-4 md:grid-cols-[1fr_260px]">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-900/60">Reasoning</p>
                          <p className="mt-2 text-sm leading-relaxed text-purple-900/90 whitespace-pre-wrap">
                            {entry.aiGrading.reasoning ?? "No reasoning provided."}
                          </p>
                        </div>
                        <div className="space-y-3 rounded-xl bg-purple-100/50 p-3">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-purple-900/60">Suggested Score</p>
                            <p className="mt-1 text-2xl font-bold text-purple-700">
                              {entry.aiGrading.suggestedScore ?? 0} <span className="text-base font-normal text-purple-900/60">/ {entry.questionSnapshot.points} pts</span>
                            </p>
                          </div>
                          {(entry.aiGrading.keyPointsAddressed?.length > 0 || entry.aiGrading.keyPointsMissed?.length > 0) && (
                            <div className="space-y-3 pt-2 border-t border-purple-200">
                              {entry.aiGrading.keyPointsAddressed?.map((point, idx) => (
                                <div key={`hit-${idx}`} className="flex items-start gap-2">
                                  <CheckCircle className="h-4 w-4 mt-0.5 text-green-600 shrink-0" />
                                  <span className="text-xs font-medium text-purple-900/80">{point}</span>
                                </div>
                              ))}
                              {entry.aiGrading.keyPointsMissed?.map((point, idx) => (
                                <div key={`miss-${idx}`} className="flex items-start gap-2">
                                  <XCircle className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                                  <span className="text-xs font-medium text-purple-900/80">{point}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {entry.reviewMode === "edit" && isEditable ? (
                    <div className="grid gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-3 lg:grid-cols-3">
                      <Label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Score awarded</span>
                        <Input
                          type="number"
                          min={0}
                          max={maxEntryScore}
                          step="0.01"
                          disabled={!canEditScore}
                          value={entry.scoreAwarded ?? 0}
                          onChange={(event) =>
                            updateEntry(entry.id, {
                              scoreAwarded: clampScore(
                                Number(event.target.value),
                                maxEntryScore,
                              ),
                            })
                          }
                          className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:bg-muted/70 disabled:text-primary/40"
                        />
                        <span className="mt-1.5 block text-xs font-medium text-inkd">
                          {canEditScore
                            ? `Allowed range: 0-${maxEntryScore} pts`
                            : "Choose Correct to edit the score."}
                        </span>
                      </Label>
                      <Label className="block">
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Correctness</span>
                        <Select
                          value={entry.isCorrect === null ? "null" : entry.isCorrect ? "true" : "false"}
                          onChange={(event) =>
                            updateEntryCorrectness(entry, event.target.value)
                          }
                          className="mt-2 w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-primary outline-none transition focus:border-primary"
                        >
                          <option value="null">Not set</option>
                          <option value="true">Correct</option>
                          <option value="false">Incorrect</option>
                        </Select>
                      </Label>
                      <div className="flex items-end">
                        <Button
                          type="button"
                          onClick={() => handleSaveReview(entry)}
                          disabled={!canSaveReview}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pl disabled:cursor-not-allowed disabled:bg-primary/25 disabled:text-primary/45"
                        >
                          <Save className="h-4 w-4" />
                          {savingIds[entry.id] ? "Saving..." : "Save review"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-3 lg:grid-cols-3">
                      <div className="rounded-xl border border-border bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Score awarded</p>
                        <p className="mt-1.5 text-base font-bold text-primary">{entry.scoreAwarded}</p>
                      </div>
                      <div className="rounded-xl border border-border bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Is correct</p>
                        <p className="mt-1.5 text-base font-bold text-primary">
                          {entry.isCorrect == null ? "Not set" : entry.isCorrect ? "Yes" : "No"}
                        </p>
                      </div>
                      <div className="rounded-xl border border-border bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-inkd">Review status</p>
                        <div className="mt-1.5">
                          {entry.gradingStatus === "PENDING" ? (
                            <div className="inline-flex items-center gap-2 text-orange-700">
                              <ShieldAlert className="h-4 w-4" />
                              <span className="font-semibold">Awaiting manual review</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-2 text-green-700">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="font-semibold">{entry.gradingStatus}</span>
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

        <div className="mt-6 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-border bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-primary">Finish manual review</p>
            <p className="mt-1 text-sm text-inkd">
              Recalculate totals and grade after saving reviewed answers.
            </p>
          </div>
          <Button
            type="button"
            onClick={handleRecalculate}
            disabled={isRecalculating}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pl disabled:cursor-not-allowed disabled:bg-primary/30 disabled:text-primary/50"
          >
            <RefreshCw className={`h-4 w-4 ${isRecalculating ? "animate-spin" : ""}`} />
            {isRecalculating ? "Recalculating..." : "Recalculate result"}
          </Button>
        </div>
      </div>

      <Modal
        open={recalculateFeedback !== null}
        onClose={() => setRecalculateFeedback(null)}
        className="max-w-md p-6"
      >
        {recalculateFeedback ? (
          <div className="space-y-5">
            <div className="flex items-start gap-4">
              <div
                className={
                  recalculateFeedback.status === "success"
                    ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700"
                    : "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-700"
                }
              >
                {recalculateFeedback.status === "success" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">
                  {recalculateFeedback.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-inkd">
                  {recalculateFeedback.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                onClick={() => setRecalculateFeedback(null)}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pl"
              >
                Done
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
