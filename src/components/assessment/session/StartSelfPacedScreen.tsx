"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AssessmentDetailQuestionItem,
  AssessmentDetailRecord,
} from "@/src/types";
import type { QuestionRendererValue } from "../renderers/types";
import {
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
  isCorrectAnswerResponse,
  requiresParticipantIdentity,
} from '@/src/lib/session/session.utils';
import {
  startSelfPacedSession,
  saveAnswerIncremental,
  submitSelfPacedSession,
  getSessionResult,
} from "@/src/lib/actions/runtime.actions";
import { toast } from "sonner";

export function StartSelfPacedScreen({
  assessment,
  questions,
}: {
  assessment: AssessmentDetailRecord;
  questions: AssessmentDetailQuestionItem[];
}) {
  const rounds = useMemo(() => buildQuestionRounds(questions), [questions]);
  const requiresEntry = assessment.settings?.participantIdentity !== "ANONYMOUS";
  const requiresIdentity = requiresParticipantIdentity(assessment.settings?.participantIdentity || "EXTERNAL");
  const resultMode = getResultReleaseMode(assessment.settings?.showResults || "AFTER_SUBMISSION");
  const showCorrectAnswers = assessment.settings?.allowReview ?? false;
  const allowShareAnswerSheet = false;
  const totalTimerSeconds = Math.max(0, (assessment.settings?.timeLimit ?? 0) * 60);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"entry" | "quiz" | "confirm" | "processing" | "end">(
    requiresEntry ? "entry" : "quiz",
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionRendererValue>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(totalTimerSeconds);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverResult, setServerResult] = useState<any>(null);

  const currentQuestion = rounds[questionIndex];
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

  async function handleAdvanceFromQuiz() {
    // Save answer incrementally
    if (sessionId && answers[currentQuestion.id] !== undefined) {
      await saveAnswerIncremental(sessionId, currentQuestion.id, answers[currentQuestion.id]);
    }

    if (questionIndex === rounds.length - 1) {
      setStep("confirm");
      return;
    }

    setQuestionIndex((currentIndex) => currentIndex + 1);
  }

  async function handleStartQuiz() {
    setIsSubmitting(true);
    let participantData = undefined;
    if (requiresIdentity && displayName.trim()) {
      participantData = { name: displayName, email: email || "" };
    }
    
    const res = await startSelfPacedSession(assessment.id, participantData);
    setIsSubmitting(false);

    if (res.success && res.data?.sessionId) {
      setSessionId(res.data.sessionId);
      setStep("quiz");
    } else {
      toast.error(res.message || "Failed to start session");
    }
  }

  async function handleSubmitSession() {
    if (!sessionId) return;
    
    // Save the last answer if changed and not saved yet (just to be safe)
    if (answers[currentQuestion.id] !== undefined) {
      await saveAnswerIncremental(sessionId, currentQuestion.id, answers[currentQuestion.id]);
    }

    setStep("processing");
    const startTime = Date.now();
    const submitRes = await submitSelfPacedSession(sessionId, assessment.id);
    if (!submitRes.success) {
      toast.error(submitRes.message || "Failed to submit session");
      setStep("confirm");
      return;
    }

    // Get the final result
    const resultRes = await getSessionResult(sessionId);
    if (resultRes.success) {
      setServerResult(resultRes.data);
    }

    // Ensure a minimum of 1.5s delay for the processing animation UX
    const elapsed = Date.now() - startTime;
    if (elapsed < 1500) {
      await new Promise(resolve => setTimeout(resolve, 1500 - elapsed));
    }

    setStep("end");
  }

  return (
    <ScreenShell
      eyebrow={step === "entry" ? "Self-paced Participant Flow" : ""}
      title={step === "entry" ? assessment.name || "Untitled" : ""}
      description={step === "entry" ? assessment.description! : ""}
      aside={null}
    >
      <div className="flex flex-1 min-h-0 flex-col">
        {step === "entry" ? (
          <SelfPacedEntry
            heading="Before you begin"
            timeLimitMinutes={assessment.settings?.timeLimit ?? 0}
            requiresIdentity={requiresIdentity}
            displayName={displayName}
            onDisplayNameChange={setDisplayName}
            email={email}
            onEmailChange={setEmail}
            helperTitle="Participant identity"
            helperDescription="Internal participants can continue without entering a display name."
            ctaLabel={isSubmitting ? "Starting..." : "Start quiz"}
            onContinue={handleStartQuiz}
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
            onNext={handleAdvanceFromQuiz}
            nextLabel={questionIndex === rounds.length - 1 ? "Review answers" : "Next question"}
            disablePrevious={questionIndex === 0}
          />
        ) : null}

        {step === "confirm" ? (
          <SelfPacedConfirm
            items={confirmationItems}
            allowGoingBack={assessment.settings?.allowReview ?? true}
            onBack={() => setStep("quiz")}
            onSubmit={handleSubmitSession}
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
