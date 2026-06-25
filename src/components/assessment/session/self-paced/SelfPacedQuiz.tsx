import { ArrowLeft, ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import type { QuestionRendererValue } from "../../renderers/types";
import { QuestionRenderer } from "../../renderers/QuestionRenderer";
import type { QuestionRound } from "../session.types";
import { hasAnswerResponse } from "../session.utils";
import { Button } from "@/src/components/ui/ui/button";

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
    <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:h-full lg:min-h-0">
      <div className="sticky top-0 z-10 rounded-[24px] border border-border bg-white px-4 py-3 text-primary shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-muted px-3 py-1 text-inkd">
            Question {questionIndex + 1}/{totalQuestions}
          </span>
          {showTimer ? (
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-inkd">
              <Clock3 className="h-3.5 w-3.5" />
              {timeLabel}
            </span>
          ) : null}
        </div>
        <div className="mt-3 grid gap-1.5 sm:grid-cols-2">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden="true">
            <div
              className="h-full rounded-full bg-primary transition"
              style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
          {showTimer ? (
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-[#F94144] transition"
                style={{ width: `${timerProgressPercent}%` }}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="flex-1 rounded-[24px] border border-border bg-white p-4 shadow-sm sm:p-5 lg:flex lg:min-h-0 lg:flex-col lg:p-8">
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

        <div className="mt-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          <QuestionRenderer question={currentQuestion} value={answerValue} onChange={onChange} />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            type="button"
            disabled={disablePrevious}
            onClick={onPrevious}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-white/70 px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50" variant="ghost"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            type="button"
            disabled={!hasAnswerResponse(answerValue)}
            onClick={onNext}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-pm disabled:cursor-not-allowed disabled:opacity-50"
          >
            {nextLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
