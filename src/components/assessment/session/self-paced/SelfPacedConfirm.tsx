import { ArrowLeft, ArrowRight, Pencil, AlertCircle } from "lucide-react";
import type { QuestionRendererValue } from "../../renderers/types";
import type { QuestionRound } from '@/src/types/session.types';
import { getAnswerResponseText } from '@/src/lib/session/session.utils';
import { Button } from "@/src/components/ui/ui/button";

export function SelfPacedConfirm({
  items,
  allowGoingBack,
  onBack,
  onSubmit,
  submitLabel,
  onEditQuestion,
}: {
  items: { question: QuestionRound; answerValue: QuestionRendererValue }[];
  allowGoingBack: boolean;
  onBack: () => void;
  onSubmit: () => void;
  submitLabel: string;
  onEditQuestion?: (index: number) => void;
}) {
  const unansweredCount = items.filter(
    ({ question, answerValue }) => !getAnswerResponseText(question, answerValue)
  ).length;

  return (
    <div className="flex h-full w-full flex-col">
      {/* Header */}
      <div className="shrink-0 flex flex-col gap-6 border-b border-border/50 pb-8 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary/60">
            Final Step
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Review Answers</h2>
          <p className="mt-2 text-sm text-primary/60">
            Check your final answer sheet before locking your submission.
          </p>
          {unansweredCount > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {unansweredCount} question{unansweredCount > 1 ? "s" : ""} left unanswered
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row shrink-0">
          {allowGoingBack ? (
            <Button
              type="button"
              onClick={onBack}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-border/60 bg-transparent px-5 text-sm font-bold text-primary transition-all hover:border-primary/20 hover:bg-primary/5 sm:w-auto" variant="ghost"
            >
              <ArrowLeft className="h-4 w-4" />
              Go back
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={onSubmit}
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-8 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary/90 hover:shadow-md sm:w-auto"
          >
            {submitLabel}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>
      </div>

      {/* Answer List */}
      <div className="flex-1 overflow-y-auto pt-2">
        <div className="divide-y divide-border/40">
          {items.map(({ question, answerValue }, index) => {
            const answerText = getAnswerResponseText(question, answerValue);
            const isUnanswered = !answerText;

            return (
              <div key={question.id} className="group flex flex-col gap-3 py-5 sm:flex-row sm:gap-6">
                {/* Question Number */}
                <div className="flex shrink-0 items-center gap-2 sm:w-16 sm:flex-col sm:items-start sm:gap-1">
                  <span className={`text-sm font-bold ${isUnanswered ? "text-amber-500" : "text-primary/30"}`}>
                    Q{index + 1}
                  </span>
                  {isUnanswered && (
                    <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-600">
                      Empty
                    </span>
                  )}
                </div>

                {/* Question & Answer */}
                <div className="flex-1 space-y-2 min-w-0">
                  <p className="text-base font-semibold leading-relaxed text-primary">{question.question}</p>
                  {question.type.toLowerCase().includes("fill") && question.rawOptions?.template ? (
                    <p className="text-sm font-medium leading-relaxed text-primary/70">{question.rawOptions.template}</p>
                  ) : null}
                  <div className={`text-base rounded-xl p-4 border ${
                    isUnanswered
                      ? "bg-amber-50/50 border-amber-200/60 text-amber-600 italic"
                      : "text-primary/70 bg-primary/[0.02] border-border/40"
                  }`}>
                    {answerText || "No answer provided"}
                  </div>
                </div>

                {/* Edit Button */}
                {onEditQuestion && (
                  <div className="flex shrink-0 items-start sm:pt-0.5">
                    <button
                      type="button"
                      onClick={() => onEditQuestion(index)}
                      className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-white px-3 py-2 text-xs font-bold text-slate-600 shadow-sm transition-all hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:-translate-y-px active:translate-y-0"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="py-12 text-center text-sm font-medium text-primary/40">
          End of answer sheet
        </div>
      </div>
    </div>
  );
}
