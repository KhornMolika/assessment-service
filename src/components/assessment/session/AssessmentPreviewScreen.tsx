"use client";

import { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import type {
  AssessmentDetailQuestionItem,
  AssessmentDetailRecord,
} from "@/src/types";
import { BackButton } from "@/src/components/ui/navigation/BackButton";
import type { QuestionRendererValue } from "../renderers/types";
import {
  AssessmentOverviewCard,
  ProcessingAnswersCard,
  QuestionOptionButton,
  ScreenShell,
} from "./SessionShared";
import { SelfPacedConfirm } from "./self-paced/SelfPacedConfirm";
import { SelfPacedEntry } from "./self-paced/SelfPacedEntry";
import { SelfPacedQuiz } from "./self-paced/SelfPacedQuiz";
import { SelfPacedResult } from "./self-paced/SelfPacedResult";
import {
  buildQuestionRounds,
  formatDurationClock,
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
  const resultMode = getResultReleaseMode(assessment.settings?.showResults || "AFTER_SUBMISSION");
  const showCorrectAnswers = assessment.settings?.allowReview ?? false;
  const allowShareAnswerSheet = false;
  const requiresEntry = assessment.settings?.participantIdentity !== "ANONYMOUS";
  const requiresDisplayName = requiresParticipantDisplayName(assessment.settings?.participantIdentity || "EXTERNAL");
  const totalTimerSeconds = Math.max(0, (assessment.settings?.timeLimit ?? 0) * 60);
  const [displayName, setDisplayName] = useState(isSelfPacedPreview ? "Creator Preview" : "");
  const [email, setEmail] = useState(isSelfPacedPreview ? "preview@example.com" : "");
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
      assessment.settings?.gradeLabels?.find((band) => percent >= band.minPercent)?.grade ??
      assessment.settings?.gradeLabels?.at(-1)?.grade ??
      "N/A";

    return {
      earnedPoints,
      totalPoints,
      grade,
      passed: percent >= (assessment.settings?.passMark ?? 0),
    };
  }, [answers, assessment.settings?.gradeLabels, assessment.settings?.passMark, rounds]);

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
      title={assessment.name || "Untitled"}
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
                  {question.options.map((option: any) => (
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
          className={
            step === "quiz" ? "lg:h-full lg:min-h-0" : ""
          }
        >
          {step === "entry" ? (
            <SelfPacedEntry
              heading="Before you begin"
              description="This preview mirrors the participant entry experience. You can answer the full flow, but nothing is saved."
              timeLimitMinutes={assessment.settings?.timeLimit ?? 0}
              requiresDisplayName={requiresDisplayName}
              displayName={displayName}
              onDisplayNameChange={setDisplayName}
              email={email}
              onEmailChange={setEmail}
              helperTitle="Participant identity"
              helperDescription={
                assessment.settings?.participantIdentity === "ANONYMOUS"
                  ? "Anonymous participants skip the display name form."
                  : "Internal participants can continue without entering a display name."
              }
              ctaLabel="Start preview quiz"
              onContinue={() => setStep("quiz")}
              backHref={backHref}
              backLabel="Back to assessment"
              showBackButton
            />
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
            <SelfPacedConfirm
              items={confirmationItems}
              allowGoingBack={assessment.settings?.allowReview ?? true}
              onBack={() => setStep("quiz")}
              onSubmit={() => setStep("processing")}
              submitLabel="Next preview step"
            />
          ) : null}

          {step === "processing" ? (
            <ProcessingAnswersCard
              title="Processing answer preview"
              description="This preview simulates the short evaluation state shown right after a participant submits the assessment."
            />
          ) : null}

          {step === "end" ? (
            <SelfPacedResult
              resultMode={resultMode}
              scoreSummary={scoreSummary}
              allowShareAnswerSheet={allowShareAnswerSheet}
              showCorrectAnswers={showCorrectAnswers}
              items={confirmationItems}
              answerSheetTitle="Answer sheet"
              answerSheetHeading="Preview every answer response"
            />
          ) : null}
        </div>
      ) : null}
    </ScreenShell>
  );
}
