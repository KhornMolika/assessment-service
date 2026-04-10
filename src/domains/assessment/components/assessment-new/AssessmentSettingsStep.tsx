"use client";

import { Clock3, Plus, Sparkles, TimerReset, Trash2 } from "lucide-react";
import type { Bank, QuestionCatalogDifficulty, QuestionCatalogItem } from "@/src/domains/content/types";
import type { NewAssessmentFormData } from "@/src/domains/assessment/types/assessment-form.types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/shared/components/ui/card";

export type AssessmentSettingsSection =
  | "SESSION_STRATEGY"
  | "QUESTION_CONFIGURATION"
  | "TIMING_RULES";

function getQuestionTypeTone(type: QuestionCatalogItem["type"]) {
  switch (type) {
    case "MCQ":
    case "Multiple Choice":
      return "bg-blue-100 text-blue-700";
    case "True/False":
      return "bg-green-100 text-green-700";
    case "Short Answer":
      return "bg-amber-100 text-amber-700";
    case "Long Essay":
      return "bg-rose-100 text-rose-700";
    case "Matching":
      return "bg-indigo-100 text-indigo-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function getDifficultyTone(difficulty: QuestionCatalogDifficulty) {
  switch (difficulty) {
    case "Easy":
      return "bg-emerald-100 text-emerald-700";
    case "Medium":
      return "bg-yellow-100 text-yellow-700";
    default:
      return "bg-red-100 text-red-700";
  }
}

export default function AssessmentSettingsStep({
  section,
  formData,
  banks,
  questions,
  questionSearch,
  onQuestionSearchChange,
  onChange,
  onQuestionToggle,
  onSelectionRuleChange,
  onGradeLabelChange,
  onAddGradeLabel,
  onRemoveGradeLabel,
}: {
  section: AssessmentSettingsSection;
  formData: NewAssessmentFormData;
  banks: Bank[];
  questions: QuestionCatalogItem[];
  questionSearch: string;
  onQuestionSearchChange: (value: string) => void;
  onChange: <K extends keyof NewAssessmentFormData>(
    field: K,
    value: NewAssessmentFormData[K],
  ) => void;
  onQuestionToggle: (questionId: string) => void;
  onSelectionRuleChange: (difficulty: "Easy" | "Medium" | "Hard", count: number) => void;
  onGradeLabelChange: (
    index: number,
    field: "grade" | "minPercent",
    value: string | number,
  ) => void;
  onAddGradeLabel: () => void;
  onRemoveGradeLabel: (index: number) => void;
}) {
  const filteredQuestions = questions.filter((question) => {
    if (formData.selectedBankId && question.bank_id !== formData.selectedBankId) {
      return false;
    }

    if (!questionSearch.trim()) {
      return true;
    }

    return question.text.toLowerCase().includes(questionSearch.trim().toLowerCase());
  });

  if (section === "SESSION_STRATEGY") {
    return (
      <Card className="border-emerald-200/80">
        <CardHeader>
          <CardTitle>Session Strategy</CardTitle>
          <CardDescription>
            Decide how participants enter the assessment and how questions are assembled.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-2">
            <button
              type="button"
              onClick={() => onChange("sessionMode", "SELF_PACED")}
              className={`rounded-2xl border p-5 text-left transition ${
                formData.sessionMode === "SELF_PACED"
                  ? "border-primary bg-emerald-50"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <TimerReset className="h-6 w-6 text-emerald-700" />
              <h3 className="mt-4 text-lg font-bold text-primary">Self-paced</h3>
              <p className="mt-1 text-sm text-inkd">
                Participants can enter on their own schedule and complete independently.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onChange("sessionMode", "REAL_TIME")}
              className={`rounded-2xl border p-5 text-left transition ${
                formData.sessionMode === "REAL_TIME"
                  ? "border-primary bg-cyan-50"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <Sparkles className="h-6 w-6 text-cyan-700" />
              <h3 className="mt-4 text-lg font-bold text-primary">Real-time</h3>
              <p className="mt-1 text-sm text-inkd">
                Host-led delivery with fixed launch windows and shared timing expectations.
              </p>
            </button>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <button
              type="button"
              onClick={() => onChange("questionSelection", "MANUAL")}
              className={`rounded-2xl border p-5 text-left transition ${
                formData.questionSelection === "MANUAL"
                  ? "border-primary bg-blue-50"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <Clock3 className="h-6 w-6 text-blue-700" />
              <h3 className="mt-4 text-lg font-bold text-primary">Manual selection</h3>
              <p className="mt-1 text-sm text-inkd">
                Hand-pick the exact questions that will appear in this assessment.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onChange("questionSelection", "DYNAMIC")}
              className={`rounded-2xl border p-5 text-left transition ${
                formData.questionSelection === "DYNAMIC"
                  ? "border-primary bg-fuchsia-50"
                  : "border-border bg-card hover:bg-muted"
              }`}
            >
              <Sparkles className="h-6 w-6 text-fuchsia-700" />
              <h3 className="mt-4 text-lg font-bold text-primary">Dynamic selection</h3>
              <p className="mt-1 text-sm text-inkd">
                Pull questions from a bank using total counts and difficulty distribution rules.
              </p>
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (section === "QUESTION_CONFIGURATION") {
    return (
      <Card className="border-emerald-200/80">
        <CardHeader>
          <CardTitle>Question Configuration</CardTitle>
          <CardDescription>
            Choose a source bank and decide whether the set is curated manually or assembled dynamically.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">Question bank</label>
              <select
                value={formData.selectedBankId}
                onChange={(event) => onChange("selectedBankId", event.target.value)}
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pm"
              >
                <option value="">All banks</option>
                {banks.map((bank) => (
                  <option key={bank.id} value={bank.id}>
                    {bank.name} ({bank.question_count} questions)
                  </option>
                ))}
              </select>
            </div>

            {formData.questionSelection === "DYNAMIC" ? (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary">Total questions</label>
                <input
                  type="number"
                  min={1}
                  value={formData.totalQuestions}
                  onChange={(event) => onChange("totalQuestions", Number(event.target.value) || 0)}
                  className="w-full rounded-lg border border-border bg-card px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pm"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-primary">Search questions</label>
                <input
                  type="text"
                  value={questionSearch}
                  onChange={(event) => onQuestionSearchChange(event.target.value)}
                  placeholder="Search question text..."
                  className="w-full rounded-lg border border-border bg-card px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pm"
                />
              </div>
            )}
          </div>

          {formData.questionSelection === "MANUAL" ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-inkd">
                  {formData.selectedQuestionIds.length} question
                  {formData.selectedQuestionIds.length === 1 ? "" : "s"} selected
                </p>
                {formData.selectedQuestionIds.length > 0 ? (
                  <button
                    type="button"
                    onClick={() => onChange("selectedQuestionIds", [])}
                    className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-primary transition hover:bg-muted"
                  >
                    Clear selection
                  </button>
                ) : null}
              </div>

              <div className="rounded-2xl border border-border bg-muted/30 p-2 sm:p-3">
                <div className="max-h-140 space-y-3 overflow-y-auto pr-1 sm:pr-2">
                  {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((question) => {
                      const selected = formData.selectedQuestionIds.includes(question.id);
                      const bank = banks.find((item) => item.id === question.bank_id);

                      return (
                        <button
                          key={question.id}
                          type="button"
                          onClick={() => onQuestionToggle(question.id)}
                          className={`w-full rounded-2xl border p-4 text-left transition ${
                            selected
                              ? "border-primary bg-emerald-50 shadow-sm"
                              : "border-border bg-card hover:bg-muted"
                          }`}
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getQuestionTypeTone(question.type)}`}
                                >
                                  {question.type}
                                </span>
                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getDifficultyTone(question.difficulty)}`}
                                >
                                  {question.difficulty}
                                </span>
                                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-inkd">
                                  {bank?.name ?? "Unknown bank"}
                                </span>
                              </div>
                              <p className="text-sm font-semibold leading-6 text-primary sm:text-base">
                                {question.text}
                              </p>
                            </div>
                            <div className="flex shrink-0 items-center justify-between gap-3 sm:block sm:text-right">
                              <div className="text-sm font-semibold text-primary">{question.points} pts</div>
                              <div
                                className={`mt-0 rounded-full px-2.5 py-1 text-xs font-semibold sm:mt-2 ${
                                  selected
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-muted text-inkd"
                                }`}
                              >
                                {selected ? "Selected" : "Tap to select"}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="rounded-2xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-inkd">
                      No questions match this bank and search combination.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {formData.selectionRules.map((rule) => (
                <div key={rule.difficulty} className="rounded-2xl border border-border bg-muted/40 p-4">
                  <label className="block text-sm font-semibold text-primary">{rule.difficulty}</label>
                  <p className="mt-1 text-xs text-inkd">Questions to pull from this difficulty bucket.</p>
                  <input
                    type="number"
                    min={0}
                    value={rule.count}
                    onChange={(event) =>
                      onSelectionRuleChange(rule.difficulty, Number(event.target.value) || 0)
                    }
                    className="mt-3 w-full rounded-lg border border-border bg-card px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pm"
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-emerald-200/80">
      <CardHeader>
        <CardTitle>Timing and Participant Rules</CardTitle>
        <CardDescription>
          Configure time windows, navigation behavior, and how results are released after submission.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Time limit (minutes)</label>
            <input
              type="number"
              min={0}
              value={formData.timeLimitMinutes}
              onChange={(event) => {
                const value = Number(event.target.value) || 0;
                onChange("timeLimitMinutes", value);
                onChange("enableTimeLimit", value > 0);
              }}
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pm"
            />
            <p className="text-xs text-inkd">Use `0` if the assessment should stay untimed.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Starts at</label>
            <input
              type="datetime-local"
              value={formData.startsAt}
              onChange={(event) => onChange("startsAt", event.target.value)}
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Ends at</label>
            <input
              type="datetime-local"
              value={formData.endsAt}
              onChange={(event) => onChange("endsAt", event.target.value)}
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pm"
            />
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-primary">Shuffle questions</h3>
                <p className="mt-1 text-sm text-inkd">
                  Randomize the order participants see to reduce predictable answer flow.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.shuffleQuestions}
                onChange={(event) => onChange("shuffleQuestions", event.target.checked)}
                className="mt-1 h-4 w-4 accent-(--p)"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-primary">Allow going back</h3>
                <p className="mt-1 text-sm text-inkd">
                  Let participants revisit earlier questions instead of forcing one-way progression.
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.allowGoingBack}
                onChange={(event) => onChange("allowGoingBack", event.target.checked)}
                className="mt-1 h-4 w-4 accent-(--p)"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Pass mark (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              value={formData.passMark}
              onChange={(event) => onChange("passMark", Number(event.target.value) || 0)}
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-primary">Show results</label>
            <select
              value={formData.showResults}
              onChange={(event) =>
                onChange("showResults", event.target.value as NewAssessmentFormData["showResults"])
              }
              className="w-full rounded-lg border border-border bg-card px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pm"
            >
              <option value="IMMEDIATELY">Immediately after submit</option>
              <option value="MANUAL">Manual release</option>
              <option value="NEVER">Never show</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-primary">Grade scale</h3>
              <p className="mt-1 text-sm text-inkd">
                Define label thresholds like A, B, C, and pass/fail cutoffs.
              </p>
            </div>
            <button
              type="button"
              onClick={onAddGradeLabel}
              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-primary transition hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
              Add label
            </button>
          </div>

          <div className="space-y-3">
            {formData.gradeLabels.map((label, index) => (
              <div key={`${label.grade}-${index}`} className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-[160px_minmax(0,1fr)_44px]">
                <input
                  type="text"
                  value={label.grade}
                  onChange={(event) => onGradeLabelChange(index, "grade", event.target.value)}
                  placeholder="Grade label"
                  className="rounded-lg border border-border bg-card px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pm"
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={label.minPercent}
                  onChange={(event) =>
                    onGradeLabelChange(index, "minPercent", Number(event.target.value) || 0)
                  }
                  placeholder="Minimum percent"
                  className="rounded-lg border border-border bg-card px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pm"
                />
                <button
                  type="button"
                  onClick={() => onRemoveGradeLabel(index)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                  aria-label={`Remove grade label ${label.grade || index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
