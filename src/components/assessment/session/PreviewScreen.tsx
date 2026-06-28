"use client";

import { useEffect, useMemo, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Eye } from "lucide-react";
import type {
  AssessmentDetailQuestionItem,
  AssessmentDetailRecord,
} from "@/src/types";
import { BackButton } from "@/src/components/ui/navigation/BackButton";
import type { QuestionRendererValue } from "../renderers/types";
import {
  ProcessingAnswersCard,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  QuestionOptionButton,
  ScreenShell,
} from "./SessionShared";
import { SelfPacedConfirm } from "./self-paced/SelfPacedConfirm";
import { SelfPacedEntry } from "./self-paced/SelfPacedEntry";
import { SelfPacedQuiz } from "./self-paced/SelfPacedQuiz";
import { SelfPacedResult } from "./self-paced/SelfPacedResult";
import { RealTimeSimulator } from "./RealTimeSimulator";
import {
  buildQuestionRounds,
  formatDurationClock,
  getResultReleaseMode,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  isCorrectAnswerResponse,
  calculateQuestionScore,
  requiresParticipantIdentity,
  shuffleArray,
} from '@/src/lib/session/session.utils';

export function PreviewScreen({
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
  const rounds = useMemo(() => {
    let qs = [...questions];
    if (assessment.settings?.isShuffle) {
      qs = shuffleArray(qs, assessment.id);
    }
    return buildQuestionRounds(qs, assessment.settings?.isShuffle ?? false);
  }, [questions, assessment.id, assessment.settings?.isShuffle]);
  const isSelfPacedPreview = previewMode === "SELF_PACED";
  const resultMode = getResultReleaseMode(assessment.settings?.showResults || "AFTER_SUBMISSION");
  const showCorrectAnswers = assessment.settings?.allowReview ?? false;
  const allowShareAnswerSheet = false;
  const requiresEntry = assessment.settings?.participantIdentity !== "ANONYMOUS";
  const requiresIdentity = requiresParticipantIdentity(assessment.settings?.participantIdentity || "EXTERNAL");
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
      return sum + calculateQuestionScore(question, answers[question.id] ?? null);
    }, 0);
    const percent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    
    const sortedGradeLabels = [...(assessment.settings?.gradeLabels || [])].sort(
      (a, b) => b.minPercent - a.minPercent
    );

    const grade =
      sortedGradeLabels.find((band) => percent >= band.minPercent)?.grade ??
      sortedGradeLabels.at(-1)?.grade ??
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
      title={assessment.name ? `Preview: ${assessment.name}` : "Assessment Preview"}
      description="Preview Mode Active — Your answers will not be recorded."
      headerAction={
        <div className="flex items-center gap-3">
          {step === "end" && (
            <button
              type="button"
              onClick={() => {
                setStep(requiresEntry ? "entry" : "quiz");
                setQuestionIndex(0);
                setAnswers({});
                setRemainingSeconds(totalTimerSeconds);
              }}
              className="inline-flex h-9 items-center justify-center rounded-xl bg-primary/10 px-4 text-sm font-bold text-primary transition-all hover:bg-primary/20"
            >
              Restart Preview
            </button>
          )}
          <BackButton
            href={backHref}
            label="Exit Preview"
          />
        </div>
      }
    >
      {!isSelfPacedPreview ? (
        <RealTimeSimulator assessment={assessment} questions={questions} />
      ) : null}

      {isSelfPacedPreview ? (
        <div className="flex flex-1 min-h-0 flex-col">
          {step === "entry" ? (
            <SelfPacedEntry
              heading="Before you begin"
              description="This preview mirrors the participant entry experience. You can answer the full flow, but nothing is saved."
              timeLimitMinutes={assessment.settings?.timeLimit ?? 0}
              requiresIdentity={requiresIdentity}
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
              submitLabel="Submit"
            />
          ) : null}

          {step === "processing" ? (
            <ProcessingAnswersCard
              title="Processing answer preview"
              description="This preview simulates the short evaluation state shown right after a participant submits the assessment."
            />
          ) : null}

          {step === "end" ? (
            <>
              <SelfPacedResult
                resultMode={resultMode}
                scoreSummary={scoreSummary}
                allowShareAnswerSheet={allowShareAnswerSheet}
                showCorrectAnswers={showCorrectAnswers}
                items={confirmationItems}
                answerSheetTitle="Answer sheet"
                answerSheetHeading="Preview every answer response"
              />
            </>
          ) : null}
        </div>
      ) : null}
    </ScreenShell>
  );
}
