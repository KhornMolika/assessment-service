"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, ShieldCheck } from "lucide-react";
import type {
  AssessmentDetailQuestionItem,
  AssessmentDetailRecord,
} from "@/src/domains/assessment/types";
import { QuestionRenderer } from "../renderers/QuestionRenderer";
import type { QuestionRendererValue } from "../renderers/types";
import {
  AssessmentOverviewCard,
  FlowStepper,
  ProcessingAnswersCard,
  QuizTimerCard,
  QuestionOptionButton,
  ShareAnswerSheetPanel,
  ScreenShell,
  TimeLimitCard,
} from "./SessionShared";
import {
  buildPreviewAnswerValue,
  buildQuestionRounds,
  formatDurationClock,
  getAnswerResponseText,
  getResultReleaseMode,
  isCorrectAnswerResponse,
} from "./session.utils";

export function AssessmentPreviewScreen({
  assessment,
  questions,
  previewMode,
  backHref,
}: {
  assessment: AssessmentDetailRecord;
  questions: AssessmentDetailQuestionItem[];
  previewMode: "SELF_PACED" | "REAL_TIME";
  backHref: string;
}) {
  const rounds = useMemo(() => buildQuestionRounds(questions), [questions]);
  const isSelfPacedPreview = previewMode === "SELF_PACED";
  const resultMode = getResultReleaseMode(assessment.show_results);
  const showCorrectAnswers = assessment.is_showed_answers;
  const allowShareAnswerSheet = assessment.is_allowed_share;
  const totalTimerSeconds = Math.max(0, assessment.time_limit_minutes * 60);
  const [step, setStep] = useState<"entry" | "quiz" | "confirm" | "processing" | "end">("entry");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(totalTimerSeconds);
  const previewAnswers = useMemo(
    () =>
      Object.fromEntries(
        rounds.map((question, index) => [question.id, buildPreviewAnswerValue(question, index)]),
      ) as Record<string, QuestionRendererValue>,
    [rounds],
  );
  const currentQuestion = rounds[questionIndex];
  const answeredCount = Object.keys(previewAnswers).length;
  const confirmationItems = rounds.map((question) => ({
    question,
    selectedOption:
      question.options.find((option) => option.id === previewAnswers[question.id]) ?? null,
  }));

  useEffect(() => {
    if (step !== "processing") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStep("end");
    }, 1600);

    return () => window.clearTimeout(timeoutId);
  }, [step]);

  useEffect(() => {
    if (step !== "quiz" || totalTimerSeconds <= 0 || remainingSeconds <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRemainingSeconds((currentSeconds) => Math.max(0, currentSeconds - 1));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [remainingSeconds, step, totalTimerSeconds]);

  return (
    <ScreenShell
      eyebrow={isSelfPacedPreview ? "Self-paced Preview" : "Real-time Preview"}
      title={assessment.title}
      description={
        isSelfPacedPreview
          ? "Creators see the self-paced participant experience in read-only mode. No answers are saved in preview."
          : "Creators see the real-time participant experience in read-only mode. No answers are saved in preview."
      }
      aside={
        isSelfPacedPreview && step === "entry" ? (
          <div className="space-y-4">
            <AssessmentOverviewCard assessment={assessment} />
            <div className="rounded-[28px] border border-border bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/60">
                Runtime state
              </p>
              <div className="mt-4 space-y-3 text-sm text-inkd">
                <div className="rounded-2xl bg-muted/30 p-4">
                  <p className="font-semibold text-primary">Answer responses saved</p>
                  <p className="mt-1">Preview mode does not save answer responses.</p>
                </div>
                <div className="rounded-2xl bg-muted/30 p-4">
                  <p className="font-semibold text-primary">Result release</p>
                  <p className="mt-1 capitalize">{resultMode}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null
      }
    >
      <FlowStepper
        steps={["Entry", "Quiz", "Confirm", "End"]}
        activeStep={step === "entry" ? 0 : step === "quiz" ? 1 : step === "confirm" ? 2 : 3}
      />

      {!isSelfPacedPreview ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <div className="rounded-[28px] border border-border bg-muted/30 p-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary ring-1 ring-border">
              <Eye className="h-4 w-4" />
              Preview only
            </div>
            <h2 className="mt-4 text-2xl font-bold text-primary">Entry screen</h2>
            <p className="mt-2 text-sm leading-6 text-inkd">
              This mirrors what a real-time participant sees before joining the live session.
              Inputs are visible, but no participant state is persisted.
            </p>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-border bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                  Identity mode
                </p>
                <p className="mt-2 text-sm font-semibold text-primary">
                  Real-time participants always enter a display name before the host starts
                </p>
              </div>
              <Link
                href={backHref}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Back to assessment
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {rounds.slice(0, 2).map((question, index) => (
              <div key={question.id} className="rounded-[28px] border border-border bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/60">
                  Question {index + 1}
                </p>
                <p className="mt-2 text-lg font-semibold text-primary">{question.question}</p>
                <div className="mt-5 grid gap-3">
                  {question.options.map((option) => (
                    <QuestionOptionButton
                      key={option.id}
                      option={option}
                      selected={false}
                      disabled
                      onClick={() => undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {isSelfPacedPreview ? (
        <div className="mt-6 rounded-4xl border border-border bg-white p-6 shadow-sm sm:p-8">
          {step === "entry" ? (
            <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#D8F3DC] px-3 py-1 text-xs font-semibold text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  Entry form
                </div>
                <h2 className="mt-4 text-3xl font-bold text-primary">Before you begin</h2>
                <p className="mt-3 text-sm leading-6 text-inkd">
                  This preview mirrors the participant entry experience, but nothing is saved.
                </p>
              </div>

              <div className="space-y-4 rounded-[28px] border border-border bg-muted/20 p-5">
                {assessment.time_limit_minutes > 0 ? (
                  <TimeLimitCard minutes={assessment.time_limit_minutes} compact />
                ) : null}

                <div className="rounded-2xl bg-white p-4 ring-1 ring-border">
                  <p className="text-sm font-semibold text-primary">Display name</p>
                  <p className="mt-2 text-sm text-inkd">
                    {assessment.participant_identity === "ANONYMOUS"
                      ? "Anonymous participant skips the form"
                      : "Participant display name field appears here"}
                  </p>
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Link
                    href={backHref}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to assessment
                  </Link>
                  <button
                    type="button"
                    onClick={() => setStep("quiz")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Next preview step
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {step === "quiz" ? (
            <div className="mx-auto max-w-4xl">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
                <div className="rounded-[28px] border border-border bg-muted/20 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                    Progress
                  </p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-primary">
                      Question {questionIndex + 1} of {rounds.length}
                    </p>
                    <p className="text-sm font-semibold text-primary">
                      {Math.round((answeredCount / rounds.length) * 100)}%
                    </p>
                  </div>
                  <div className="mt-4 h-3 rounded-full bg-white ring-1 ring-border">
                    <div
                      className="h-full rounded-full bg-primary transition"
                      style={{ width: `${(answeredCount / rounds.length) * 100}%` }}
                    />
                  </div>
                </div>

                {totalTimerSeconds > 0 ? (
                  <QuizTimerCard
                    timeLabel={formatDurationClock(remainingSeconds)}
                    progressPercent={(remainingSeconds / totalTimerSeconds) * 100}
                  />
                ) : null}
              </div>

              <div className="mt-6 rounded-[28px] border border-border bg-white p-6 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                  Question form
                </p>
                <h2 className="mt-2 text-2xl font-bold text-primary">{currentQuestion.question}</h2>
                <div className="mt-6">
                  <QuestionRenderer
                    question={currentQuestion}
                    value={previewAnswers[currentQuestion.id] ?? null}
                    disabled
                    onChange={() => undefined}
                  />
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <button
                    type="button"
                    disabled={questionIndex === 0}
                    onClick={() => setQuestionIndex((currentIndex) => Math.max(0, currentIndex - 1))}
                    className="rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (questionIndex === rounds.length - 1) {
                        setStep("confirm");
                        return;
                      }
                      setQuestionIndex((currentIndex) => currentIndex + 1);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    {questionIndex === rounds.length - 1 ? "Review answers" : "Next question"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {step === "confirm" ? (
            <div className="mx-auto max-w-4xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                    Confirmation
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-primary">Review selected answers</h2>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  {assessment.allow_going_back ? (
                    <button
                      type="button"
                      onClick={() => setStep("quiz")}
                      className="inline-flex items-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Change answers
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setStep("processing")}
                    className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Next preview step
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {confirmationItems.map(({ question, selectedOption }, index) => (
                  <div key={question.id} className="rounded-[28px] border border-border bg-muted/20 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                      Question {index + 1}
                    </p>
                    <p className="mt-2 text-base font-semibold text-primary">{question.question}</p>
                    <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-border">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                        Selected answer
                      </p>
                      <p className="mt-2 text-sm text-inkd">
                        {getAnswerResponseText(question, selectedOption?.id ?? null)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {step === "processing" ? (
            <ProcessingAnswersCard
              title="Processing answer preview"
              description="This preview simulates the short evaluation state shown right after a participant submits the assessment."
            />
          ) : null}

          {step === "end" ? (
            <div className="mx-auto max-w-6xl space-y-6">
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(24rem,0.9fr)]">
                <div className="rounded-[32px] border border-border bg-[#16352A] p-6 text-white shadow-sm lg:p-8">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                    Result
                  </p>
                  {resultMode === "immediate" ? (
                    <>
                      <h2 className="mt-3 text-3xl font-bold">Results available now</h2>
                      <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
                        This preview shows how the published score summary and answer sheet can
                        look on a larger participant screen, without saving anything.
                      </p>
                    </>
                  ) : null}
                  {resultMode === "manual" ? (
                    <h2 className="mt-3 text-3xl font-bold">Results will be released later</h2>
                  ) : null}
                  {resultMode === "hidden" ? (
                    <h2 className="mt-3 text-3xl font-bold">Submission received</h2>
                  ) : null}
                </div>

                {resultMode === "immediate" ? (
                  <ShareAnswerSheetPanel enabled={allowShareAnswerSheet} />
                ) : null}
              </div>

              {resultMode !== "hidden" ? (
                <div className="rounded-[32px] border border-border bg-white p-6 shadow-sm lg:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                        Answer sheet
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-primary">
                        Preview every answer response
                      </h3>
                    </div>
                    <div className="rounded-full bg-muted/20 px-4 py-2 text-sm font-semibold text-primary">
                      {confirmationItems.length} questions
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 xl:grid-cols-2">
                    {confirmationItems.map(({ question, selectedOption }) => {
                      const answerValue = selectedOption?.id ?? null;
                      const isCorrect = isCorrectAnswerResponse(question, answerValue);
                      const answerTone = isCorrect
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-rose-200 bg-rose-50";

                      return (
                        <div key={question.id} className={`rounded-[28px] border p-5 ${answerTone}`}>
                          <p className="text-sm font-semibold text-primary">{question.question}</p>
                          <div className="mt-3 flex items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                                isCorrect
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-rose-100 text-rose-700"
                              }`}
                            >
                              {isCorrect ? "Correct" : "Incorrect"}
                            </span>
                          </div>
                          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                            Your answer response
                          </p>
                          <p className="mt-1 text-sm leading-6 text-inkd">
                            {getAnswerResponseText(question, answerValue)}
                          </p>
                          {resultMode === "immediate" && showCorrectAnswers ? (
                            <>
                              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                                Correct answer
                              </p>
                              <p className="mt-1 text-sm leading-6 text-inkd">
                                {
                                  question.options.find(
                                    (option) => option.id === question.correctOptionId,
                                  )?.text
                                }
                              </p>
                            </>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </ScreenShell>
  );
}
