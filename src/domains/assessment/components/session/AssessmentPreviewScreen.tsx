"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Eye, ShieldCheck } from "lucide-react";
import type {
  AssessmentDetailQuestionItem,
  AssessmentDetailRecord,
} from "@/src/domains/assessment/types";
import { BackButton } from "@/src/shared/components/navigation/BackButton";
import type { QuestionRendererValue } from "../renderers/types";
import {
  AssessmentOverviewCard,
  ProcessingAnswersCard,
  QuestionOptionButton,
  ShareAnswerSheetPanel,
  ScreenShell,
  TimeLimitCard,
} from "./SessionShared";
import { SelfPacedQuiz } from "./self-paced/SelfPacedQuiz";
import {
  buildQuestionRounds,
  formatDurationClock,
  getAnswerResponseText,
  getResultReleaseMode,
  isCorrectAnswerResponse,
  requiresParticipantDisplayName,
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
  const requiresEntry = assessment.participant_identity !== "ANONYMOUS";
  const requiresDisplayName = requiresParticipantDisplayName(assessment.participant_identity);
  const totalTimerSeconds = Math.max(0, assessment.time_limit_minutes * 60);
  const [displayName, setDisplayName] = useState("");
  const [step, setStep] = useState<"entry" | "quiz" | "confirm" | "processing" | "end">(
    requiresEntry ? "entry" : "quiz",
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(totalTimerSeconds);
  const [answers, setAnswers] = useState<Record<string, QuestionRendererValue>>({});
  const currentQuestion = rounds[questionIndex];
  const confirmationItems = rounds.map((question) => ({
    question,
    answerValue: answers[question.id] ?? null,
  }));
  const scoreSummary = useMemo(() => {
    const totalPoints = rounds.reduce((sum, question) => sum + question.points, 0);
    const earnedPoints = rounds.reduce((sum, question) => {
      return isCorrectAnswerResponse(question, answers[question.id] ?? null)
        ? sum + question.points
        : sum;
    }, 0);
    const percent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const grade =
      assessment.grade_scale.find((band) => percent >= band.minPercent)?.grade ??
      assessment.grade_scale.at(-1)?.grade ??
      "N/A";

    return {
      earnedPoints,
      totalPoints,
      grade,
      passed: percent >= assessment.pass_mark,
    };
  }, [answers, assessment.grade_scale, assessment.pass_mark, rounds]);

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

  function handleSelectAnswer(value: QuestionRendererValue) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion.id]: value,
    }));
  }

  return (
    <ScreenShell
      eyebrow={isSelfPacedPreview ? "Self-paced Preview" : "Real-time Preview"}
      title={assessment.title}
      description={
        isSelfPacedPreview
          ? "Creators can complete the self-paced participant experience as a dry run. Answers are evaluated in the UI, but nothing is saved in preview."
          : "Creators see the real-time participant experience in read-only mode. No answers are saved in preview."
      }
      headerAction={
        <BackButton
          href={backHref}
          label="Back to assessment"
        />
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
                  <p className="mt-1">Preview mode evaluates answers without saving them.</p>
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
      {!isSelfPacedPreview ? (
        <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
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
              <BackButton
                href={backHref}
                label="Back to assessment"
                variant="solid"
                fullWidth
              />
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
        <div
          className={`rounded-4xl border border-border bg-white shadow-sm ${
            step === "quiz" ? "p-3 sm:p-4" : "p-6 sm:p-8"
          }`}
        >
          {step === "entry" ? (
            <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#D8F3DC] px-3 py-1 text-xs font-semibold text-primary">
                  <ShieldCheck className="h-4 w-4" />
                  Entry form
                </div>
                <h2 className="mt-4 text-3xl font-bold text-primary">Before you begin</h2>
                <p className="mt-3 text-sm leading-6 text-inkd">
                  This preview mirrors the participant entry experience. You can answer the full
                  flow, but nothing is saved.
                </p>
              </div>

              <div className="space-y-4 rounded-[28px] border border-border bg-muted/20 p-5">
                {assessment.time_limit_minutes > 0 ? (
                  <TimeLimitCard minutes={assessment.time_limit_minutes} compact />
                ) : null}

                {assessment.participant_identity === "ANONYMOUS" ? (
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-border">
                    <p className="text-sm font-semibold text-primary">Display name</p>
                    <p className="mt-2 text-sm text-inkd">Anonymous participant skips the form</p>
                  </div>
                ) : requiresDisplayName ? (
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-primary">Display name</span>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      placeholder="Enter your display name"
                      className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-primary"
                    />
                  </label>
                ) : (
                  <div className="rounded-2xl bg-white p-4 ring-1 ring-border">
                    <p className="text-sm font-semibold text-primary">Participant identity</p>
                    <p className="mt-2 text-sm text-inkd">
                      Internal participants can continue without entering a display name.
                    </p>
                  </div>
                )}
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <BackButton
                    href={backHref}
                    label="Back to assessment"
                  />
                  <button
                    type="button"
                    disabled={requiresDisplayName && displayName.trim().length === 0}
                    onClick={() => setStep("quiz")}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    Start preview quiz
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {step === "quiz" ? (
            <SelfPacedQuiz
              currentQuestion={currentQuestion}
              questionIndex={questionIndex}
              totalQuestions={rounds.length}
              timeLabel={formatDurationClock(remainingSeconds)}
              timerProgressPercent={(remainingSeconds / totalTimerSeconds) * 100}
              showTimer={totalTimerSeconds > 0}
              answerValue={answers[currentQuestion.id] ?? null}
              onChange={handleSelectAnswer}
              onPrevious={() => setQuestionIndex((currentIndex) => Math.max(0, currentIndex - 1))}
              onNext={() => {
                if (questionIndex === rounds.length - 1) {
                  setStep("confirm");
                  return;
                }
                setQuestionIndex((currentIndex) => currentIndex + 1);
              }}
              nextLabel={questionIndex === rounds.length - 1 ? "Review answers" : "Next question"}
              disablePrevious={questionIndex === 0}
            />
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
                {confirmationItems.map(({ question, answerValue }, index) => (
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
                        {getAnswerResponseText(question, answerValue)}
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
                <div className="rounded-4xl border border-border bg-[#16352A] p-6 text-white shadow-sm lg:p-8">
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
                      <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-white/55">Score</p>
                          <p className="mt-2 text-2xl font-bold">
                            {scoreSummary.earnedPoints}/{scoreSummary.totalPoints}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-white/55">Grade</p>
                          <p className="mt-2 text-2xl font-bold">{scoreSummary.grade}</p>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-white/55">Status</p>
                          <p className="mt-2 text-2xl font-bold">
                            {scoreSummary.passed ? "Pass" : "Fail"}
                          </p>
                        </div>
                      </div>
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
                <div className="rounded-4xl border border-border bg-white p-6 shadow-sm lg:p-8">
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
                    {confirmationItems.map(({ question, answerValue }, index) => {
                      const isCorrect = isCorrectAnswerResponse(question, answerValue);
                      const answerTone = isCorrect
                        ? "border-emerald-200 bg-emerald-50"
                        : "border-rose-200 bg-rose-50";

                      return (
                        <div key={question.id} className={`rounded-[28px] border p-5 ${answerTone}`}>
                          <div className="flex items-start gap-3">
                            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                              {index + 1}
                            </span>
                            <p className="pt-1 text-sm font-semibold text-primary">{question.question}</p>
                          </div>
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
