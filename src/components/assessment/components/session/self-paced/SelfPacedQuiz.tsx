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
      <div className="sticky top-0 z-10 rounded-[28px] border border-[#1C5C45]/20 bg-[linear-gradient(180deg,#16352A_0%,#214E3C_100%)] px-4 py-3 text-white shadow-[0_18px_45px_rgba(22,53,42,0.16)] backdrop-blur">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
          <span className="rounded-full bg-white/10 px-3 py-1">
            Question {questionIndex + 1}/{totalQuestions}
          </span>
          {showTimer ? (
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#FFD166] px-3 py-1 text-primary">
              <Clock3 className="h-3.5 w-3.5" />
              {timeLabel}
            </span>
          ) : null}
        </div>
        <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
          <div className="rt-progress-shimmer h-2 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#4CC9F0_0%,#7FE0C0_100%)] transition"
              style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
          {showTimer ? (
            <div className="rt-progress-shimmer h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#F9C74F_0%,#FFD166_100%)] transition"
                style={{ width: `${timerProgressPercent}%` }}
              />
            </div>
          ) : null}
        </div>
      </div>

      <div className="rt-card-pop flex-1 rounded-[30px] border border-[#FFD166]/55 bg-[linear-gradient(135deg,#FFF6CC_0%,#FFE7B8_42%,#FFF9E1_100%)] p-4 shadow-sm sm:p-5 lg:flex lg:min-h-0 lg:flex-col lg:p-6">
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

        <div className="mt-5 rounded-[28px] border border-white/70 bg-white/80 p-3 shadow-sm sm:p-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
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
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#F94144_0%,#FF6B6F_100%)] px-4 py-2.5 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50" variant="ghost"
          >
            {nextLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
