"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  AssessmentDetailQuestionItem,
  AssessmentDetailRecord,
} from "@/src/types";
import type { QuestionRendererValue } from "../renderers/types";
import type { QuestionRound } from "@/src/types/session.types";
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
  calculateQuestionScore,
  formatDurationClock,
  getResultReleaseMode,
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
  const initialRounds = useMemo(() => buildQuestionRounds(questions), [questions]);
  const [sessionRounds, setSessionRounds] = useState<QuestionRound[]>([]);
  const rounds = sessionRounds.length > 0 ? sessionRounds : initialRounds;
  const isDynamicAssessment = assessment.settings?.questionSelection === "DYNAMIC";
  const requiresEntry = assessment.settings?.participantIdentity !== "ANONYMOUS";
  const requiresIdentity = requiresParticipantIdentity(assessment.settings?.participantIdentity || "EXTERNAL");
  const resultMode = getResultReleaseMode(assessment.settings?.showResults || "AFTER_SUBMISSION");
  const showCorrectAnswers = assessment.settings?.allowReview ?? false;
  const allowShareAnswerSheet = assessment.settings?.isAllowShare === true;
  const totalTimerSeconds = Math.max(0, (assessment.settings?.timeLimit ?? 0) * 60);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"entry" | "quiz" | "confirm" | "processing" | "end">(
    requiresEntry || isDynamicAssessment || initialRounds.length === 0 ? "entry" : "quiz",
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionRendererValue>>({});
  const [remainingSeconds, setRemainingSeconds] = useState(totalTimerSeconds);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [serverResult, setServerResult] = useState<any>(null);


  const currentQuestion = rounds[questionIndex] ?? null;
  const confirmationItems = rounds.map((question) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const serverEntry = serverResult?.entries?.find((e: any) => e.assessmentQuestionId === question.id || e.assessmentQuestion?.id === question.id);
    return {
      question,
      answerValue: answers[question.id] ?? null,
      serverScore: serverEntry ? (serverEntry.scoreAwarded !== null && serverEntry.scoreAwarded !== undefined ? Number(serverEntry.scoreAwarded) : null) : undefined,
      gradingStatus: serverEntry?.gradingStatus,
    };
  });

  const scoreSummary = useMemo(() => {
    const totalPoints = rounds.reduce((sum, question) => sum + (question.points || 0), 0);
    const earnedPointsRaw = rounds.reduce((sum, question) => {
      return sum + calculateQuestionScore(question, answers[question.id] ?? null);
    }, 0);
    const earnedPoints = parseFloat(earnedPointsRaw.toFixed(2));
    
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

  const finalScoreSummary = serverResult ? {
    earnedPoints: serverResult.totalScore ?? scoreSummary.earnedPoints,
    totalPoints: serverResult.maxScore ?? scoreSummary.totalPoints,
    grade: serverResult.grade ?? scoreSummary.grade,
    passed: serverResult.isPassed ?? scoreSummary.passed,
  } : scoreSummary;



    // Poll for real-time updates when on the end screen
  useEffect(() => {
    if (step !== "end" || !sessionId) return;
    const interval = setInterval(async () => {
      const res = await getSessionResult(sessionId);
      if (res.success) {
        setServerResult(res.data);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [step, sessionId]);

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
    if (!currentQuestion) return;
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [currentQuestion.id]: value,
    }));
  }

  async function handleAdvanceFromQuiz() {
    if (!currentQuestion) {
      toast.error("No question is available for this assessment.");
      setStep("entry");
      return;
    }

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
    
    const res = await startSelfPacedSession(assessment.id, participantData, {
      ignoreExistingSession: isDynamicAssessment,
    });
    setIsSubmitting(false);

    if (res.success && res.data?.sessionId) {
      const runtimeQuestions = mapRuntimeQuestionsToDetailItems(res.data.questions);
      if (runtimeQuestions.length > 0) {
        setSessionRounds(buildQuestionRounds(runtimeQuestions));
        setQuestionIndex(0);
        setAnswers({});
      } else if (initialRounds.length === 0) {
        toast.error("No questions are available for this assessment.");
        return;
      }
      setSessionId(res.data.sessionId);
      setStep("quiz");
    } else {
      toast.error(res.message || "Failed to start session");
    }
  }

  async function handleSubmitSession() {
    if (!sessionId) return;
    if (!currentQuestion) {
      toast.error("No question is available to submit.");
      setStep("entry");
      return;
    }
    
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

    // Get the final result, polling if it's still being graded by AI
    let resultRes = await getSessionResult(sessionId);
    let attempts = 0;
    while (resultRes.success && resultRes.data?.status === "REQUIRES_REVIEW" && attempts < 10) {
      // If AI is enabled, the backend processes it. Wait 2 seconds and poll again.
      await new Promise(resolve => setTimeout(resolve, 2000));
      resultRes = await getSessionResult(sessionId);
      attempts++;
    }

    if (resultRes.success) {
      setServerResult(resultRes.data);
    }

    // Ensure a minimum of 1.5s delay for the processing animation UX if no polling occurred
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
      viewportLocked={step === "quiz"}
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
          currentQuestion ? (
            <SelfPacedQuiz
              currentQuestion={currentQuestion}
              questionIndex={questionIndex}
              totalQuestions={rounds.length}
              timeLabel={formatDurationClock(remainingSeconds)}
              timerProgressPercent={totalTimerSeconds > 0 ? (remainingSeconds / totalTimerSeconds) * 100 : 0}
              showTimer={totalTimerSeconds > 0}
              answerValue={answers[currentQuestion.id] ?? null}
              onChange={handleSelectAnswer}
              onPrevious={() => setQuestionIndex((currentIndex) => Math.max(0, currentIndex - 1))}
              onNext={handleAdvanceFromQuiz}
              nextLabel={questionIndex === rounds.length - 1 ? "Review answers" : "Next question"}
              disablePrevious={questionIndex === 0}
            />
          ) : (
            <ProcessingAnswersCard
              title="No questions available"
              description="This assessment does not have any questions ready yet. Please ask the host to review the dynamic question source."
            />
          )
        ) : null}

        {step === "confirm" ? (
          <SelfPacedConfirm
            items={confirmationItems}
            allowGoingBack={assessment.settings?.allowReview ?? true}
            onBack={() => setStep("quiz")}
            onSubmit={handleSubmitSession}
            submitLabel="Submit answers"
            onEditQuestion={(index) => {
              setQuestionIndex(index);
              setStep("quiz");
            }}
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
            shareUrl={`/public-results/${sessionId}`}
            resultMode={resultMode}
            scoreSummary={finalScoreSummary}
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

function mapRuntimeQuestionsToDetailItems(value: unknown): AssessmentDetailQuestionItem[] {
  if (!Array.isArray(value)) return [];

  return value.reduce<AssessmentDetailQuestionItem[]>((items, question) => {
    if (!question || typeof question !== "object") return items;

    const runtimeQuestion = question as {
      assessmentQuestionId?: string;
      questionId?: string;
      type?: string;
      questionText?: string;
      points?: number | string;
      options?: unknown;
    };
    const id = runtimeQuestion.assessmentQuestionId || runtimeQuestion.questionId;
    if (!id || !runtimeQuestion.questionText || !runtimeQuestion.type) {
      return items;
    }

    items.push({
      id,
      question_id: runtimeQuestion.questionId,
      question: runtimeQuestion.questionText,
      type: runtimeQuestion.type,
      points: Number(runtimeQuestion.points ?? 0),
      options: runtimeQuestion.options,
      rawOptions: runtimeQuestion.options,
    });

    return items;
  }, []);
}
