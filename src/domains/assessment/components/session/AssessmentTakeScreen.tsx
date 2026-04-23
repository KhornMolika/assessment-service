"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AssessmentDetailQuestionItem,
  AssessmentDetailRecord,
} from "@/src/domains/assessment/types";
import type { QuestionRendererValue } from "../renderers/types";
import {
  AssessmentOverviewCard,
  FlowStepper,
  ProcessingAnswersCard,
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
  hasAnswerResponse,
  isCorrectAnswerResponse,
  requiresParticipantDisplayName,
} from "./session.utils";

export function AssessmentTakeScreen({
  assessment,
  questions,
}: {
  assessment: AssessmentDetailRecord;
  questions: AssessmentDetailQuestionItem[];
}) {
  const rounds = useMemo(() => buildQuestionRounds(questions), [questions]);
  const requiresEntry = assessment.participant_identity !== "ANONYMOUS";
  const requiresDisplayName = requiresParticipantDisplayName(assessment.participant_identity);
  const resultMode = getResultReleaseMode(assessment.show_results);
  const showCorrectAnswers = assessment.is_showed_answers;
  const allowShareAnswerSheet = assessment.is_allowed_share;
  const totalTimerSeconds = Math.max(0, assessment.time_limit_minutes * 60);
  const [displayName, setDisplayName] = useState("");
  const [step, setStep] = useState<"entry" | "quiz" | "confirm" | "processing" | "end">(
    requiresEntry ? "entry" : "quiz",
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionRendererValue>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(totalTimerSeconds);

  const currentQuestion = rounds[questionIndex];
  const answeredCount = Object.values(answers).filter((answer) => hasAnswerResponse(answer)).length;
  const confirmationItems = rounds.map((question) => {
    return {
      question,
      answerValue: answers[question.id] ?? null,
    };
  });

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

  const activeStepIndex =
    step === "entry" ? 0 : step === "quiz" ? 1 : step === "confirm" ? 2 : 3;

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

  function handleAdvanceFromQuiz() {
    if (questionIndex === rounds.length - 1) {
      setStep("confirm");
      return;
    }

    setQuestionIndex((currentIndex) => currentIndex + 1);
  }

  return (
    <ScreenShell
      eyebrow="Self-paced Participant Flow"
      title={assessment.title}
      description={assessment.description!}
      aside={
        step === "entry" ? (
          <div className="space-y-4">
            <AssessmentOverviewCard assessment={assessment} />
            <div className="rounded-[28px] border border-border bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/60">
                Runtime state
              </p>
              <div className="mt-4 space-y-3 text-sm text-inkd">
                <div className="rounded-2xl bg-muted/30 p-4">
                  <p className="font-semibold text-primary">Answer responses saved</p>
                  <p className="mt-1">{answeredCount} answers captured as answer responses.</p>
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
      <FlowStepper steps={["Entry", "Quiz", "Confirm", "End"]} activeStep={activeStepIndex} />

      <div className="mt-6 rounded-4xl border border-border bg-white p-6 shadow-sm sm:p-8">
        {step === "entry" ? (
          <SelfPacedEntry
            heading="Before you begin"
            timeLimitMinutes={assessment.time_limit_minutes}
            requiresDisplayName={requiresDisplayName}
            displayName={displayName}
            onDisplayNameChange={setDisplayName}
            helperTitle="Participant identity"
            helperDescription="Internal participants can continue without entering a display name."
            ctaLabel="Start quiz"
            onContinue={() => setStep("quiz")}
          />
        ) : null}

        {step === "quiz" ? (
          <SelfPacedQuiz
            currentQuestion={currentQuestion}
            questionIndex={questionIndex}
            totalQuestions={rounds.length}
            answeredCount={answeredCount}
            timeLabel={formatDurationClock(remainingSeconds)}
            timerProgressPercent={(remainingSeconds / totalTimerSeconds) * 100}
            showTimer={totalTimerSeconds > 0}
            answerValue={answers[currentQuestion.id] ?? null}
            onChange={handleSelectAnswer}
            onPrevious={() => setQuestionIndex((currentIndex) => Math.max(0, currentIndex - 1))}
            onNext={handleAdvanceFromQuiz}
            nextLabel={questionIndex === rounds.length - 1 ? "Review answers" : "Next question"}
            disablePrevious={questionIndex === 0}
          />
        ) : null}

        {step === "confirm" ? (
          <SelfPacedConfirm
            items={confirmationItems}
            allowGoingBack={assessment.allow_going_back}
            onBack={() => setStep("quiz")}
            onSubmit={() => setStep("processing")}
            submitLabel="Submit answers"
          />
        ) : null}

        {step === "processing" ? (
          <ProcessingAnswersCard
            title="Processing your answers"
            description="We are reviewing your answer responses and preparing a clean result sheet for you."
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
            answerSheetHeading="Review every answer response"
          />
        ) : null}
      </div>
    </ScreenShell>
  );
}
