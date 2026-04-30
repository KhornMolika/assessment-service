import { ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import type { QuestionRendererValue } from "../../renderers/types";
import { QuestionRenderer } from "../../renderers/QuestionRenderer";
import type { QuestionRound } from "../session.types";
import { hasAnswerResponse } from "../session.utils";

export function SelfPacedQuiz({
  currentQuestion,
  questionIndex,
  totalQuestions,
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
    <div className="mx-auto max-w-5xl">
      <div className="sticky top-0 z-10 rounded-2xl border border-border bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-primary">
          <span className="rounded-full bg-muted px-3 py-1">
            Question {questionIndex + 1}/{totalQuestions}
          </span>
          {showTimer ? (
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-white">
              <Clock3 className="h-3.5 w-3.5" />
              {timeLabel}
            </span>
          ) : null}
        </div>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <div
              className="h-full rounded-full bg-primary transition"
              style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
          {showTimer ? (
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[#52B788] transition"
                style={{ width: `${timerProgressPercent}%` }}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 rounded-[28px] border border-border bg-white p-4 shadow-sm sm:p-5 lg:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
              Question form
            </p>
            <h2 className="mt-2 text-xl font-bold leading-tight text-primary sm:text-2xl">
              {currentQuestion.question}
            </h2>
          </div>
          {hasAnswerResponse(answerValue) ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#D8F3DC] px-3 py-1 text-xs font-semibold text-primary">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Saved
            </div>
          ) : null}
        </div>

        <div className="mt-5">
          <QuestionRenderer question={currentQuestion} value={answerValue} onChange={onChange} />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            disabled={disablePrevious}
            onClick={onPrevious}
            className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!hasAnswerResponse(answerValue)}
            onClick={onNext}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {nextLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
