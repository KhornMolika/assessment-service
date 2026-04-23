import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { QuestionRendererValue } from "../../renderers/types";
import { QuestionRenderer } from "../../renderers/QuestionRenderer";
import { QuizTimerCard } from "../SessionShared";
import type { QuestionRound } from "../session.types";
import { hasAnswerResponse } from "../session.utils";

export function SelfPacedQuiz({
  currentQuestion,
  questionIndex,
  totalQuestions,
  answeredCount,
  timeLabel,
  timerProgressPercent,
  showTimer,
  answerValue,
  onChange,
  onPrevious,
  onNext,
  nextLabel,
  disablePrevious,
}: {
  currentQuestion: QuestionRound;
  questionIndex: number;
  totalQuestions: number;
  answeredCount: number;
  timeLabel: string;
  timerProgressPercent: number;
  showTimer: boolean;
  answerValue: QuestionRendererValue;
  onChange: (value: QuestionRendererValue) => void;
  onPrevious: () => void;
  onNext: () => void;
  nextLabel: string;
  disablePrevious: boolean;
}) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-[28px] border border-border bg-muted/20 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">Progress</p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-primary">
              Question {questionIndex + 1} of {totalQuestions}
            </p>
            <p className="text-sm font-semibold text-primary">
              {Math.round((answeredCount / totalQuestions) * 100)}%
            </p>
          </div>
          <div className="mt-4 h-3 rounded-full bg-white ring-1 ring-border">
            <div
              className="h-full rounded-full bg-primary transition"
              style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {showTimer ? (
          <QuizTimerCard timeLabel={timeLabel} progressPercent={timerProgressPercent} />
        ) : null}
      </div>

      <div className="mt-6 rounded-[28px] border border-border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
              Question form
            </p>
            <h2 className="mt-2 text-2xl font-bold text-primary">{currentQuestion.question}</h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[#D8F3DC] px-3 py-1 text-xs font-semibold text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Save each answer as answer response
          </div>
        </div>

        <div className="mt-6">
          <QuestionRenderer question={currentQuestion} value={answerValue} onChange={onChange} />
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            disabled={disablePrevious}
            onClick={onPrevious}
            className="rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!hasAnswerResponse(answerValue)}
            onClick={onNext}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {nextLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
