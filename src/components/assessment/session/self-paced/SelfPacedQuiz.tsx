import { ArrowLeft, ArrowRight, CheckCircle2, Clock3 } from "lucide-react";
import type { QuestionRendererValue } from "../../renderers/types";
import { QuestionRenderer } from "../../renderers/QuestionRenderer";
import type { QuestionRound } from '@/src/types/session.types';
import { hasAnswerResponse } from '@/src/lib/session/session.utils';
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
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-6 lg:min-h-0">
      
      {/* Floating Header */}
      <div className="shrink-0 rounded-[28px] border border-border/50 bg-white/60 p-4 shadow-xl shadow-primary/5 backdrop-blur-xl sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-white shadow-md shadow-primary/20">
              Q{questionIndex + 1}
              <span className="mx-1.5 text-primary/40">/</span>
              <span className="text-white/80">{totalQuestions}</span>
            </div>
            
            {hasAnswerResponse(currentQuestion, answerValue) ? (
              <div className="flex h-10 items-center gap-1.5 rounded-xl border border-emerald-200/60 bg-emerald-50/80 px-4 text-sm font-bold text-emerald-700 shadow-sm backdrop-blur-sm transition-all duration-300 animate-in fade-in zoom-in-95">
                <CheckCircle2 className="h-4 w-4" />
                Saved
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-4 sm:justify-end">
            <div className="hidden h-2 w-32 overflow-hidden rounded-full bg-muted/60 shadow-inner sm:block">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#4CC9F0_0%,#277DA1_100%)] transition-all duration-500 ease-out"
                style={{ width: `${((questionIndex + 1) / totalQuestions) * 100}%` }}
              />
            </div>

            {showTimer ? (
              <div className="flex h-10 items-center gap-2.5 rounded-xl border border-rose-200/60 bg-rose-50/80 px-4 shadow-sm backdrop-blur-sm">
                <Clock3 className="h-4 w-4 text-rose-600 animate-pulse" />
                <span className="w-12 text-sm font-bold tabular-nums text-rose-700">{timeLabel}</span>
                <div className="ml-1 h-1.5 w-16 overflow-hidden rounded-full bg-rose-200/50">
                  <div
                    className="h-full rounded-full bg-rose-500 transition-all duration-1000 ease-linear"
                    style={{ width: `${timerProgressPercent}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="flex min-h-[50vh] flex-1 flex-col overflow-hidden rounded-4xl border border-border/60 bg-white/80 shadow-2xl shadow-primary/5 backdrop-blur-xl lg:min-h-0">
        
        {/* Question Text Area */}
        <div className="shrink-0 border-b border-border/50 bg-linear-to-b from-primary/2 to-transparent p-4">
          <h2 className="text-xl font-bold leading-relaxed text-primary sm:text-2xl">
            {currentQuestion.question}
          </h2>
        </div>

        {/* Renderer Area */}
        <div className="flex flex-1 flex-col overflow-y-auto p-6 sm:p-10">
          <div className="flex w-full flex-1 flex-col justify-center">
            <QuestionRenderer question={currentQuestion} value={answerValue} onChange={onChange} />
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="shrink-0 border-t border-border/50 bg-white/50 p-4 backdrop-blur-md sm:px-10 sm:py-4">
          <div className="mx-auto flex max-w-3xl flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              disabled={disablePrevious}
              onClick={onPrevious}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-border/60 bg-white px-6 text-sm font-bold text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-border hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <Button
              type="button"
              disabled={!hasAnswerResponse(currentQuestion, answerValue)}
              onClick={onNext}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-8 text-sm font-bold text-white shadow-lg shadow-primary/20 transition hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-xl hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none sm:w-auto"
            >
              {nextLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
