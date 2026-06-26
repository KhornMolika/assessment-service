import { ArrowLeft, ArrowRight } from "lucide-react";
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
}: {
  items: { question: QuestionRound; answerValue: QuestionRendererValue }[];
  allowGoingBack: boolean;
  onBack: () => void;
  onSubmit: () => void;
  submitLabel: string;
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-col gap-8">
      {/* Premium Glass Header */}
      <div className="shrink-0 overflow-hidden rounded-[32px] border border-border/60 bg-white/70 shadow-2xl shadow-primary/5 backdrop-blur-xl relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-transparent pointer-events-none" />
        <div className="relative px-6 py-8 sm:px-10 sm:py-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary mb-4">
              Confirmation
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Review your answers</h2>
            <p className="mt-3 text-base leading-relaxed text-primary/70">
              Check your final answer sheet before locking your submission. Once submitted, you cannot change your answers.
            </p>
          </div>
          
          <div className="flex flex-col gap-3 sm:flex-row shrink-0">
            {allowGoingBack ? (
              <Button
                type="button"
                onClick={onBack}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border-2 border-border/60 bg-white/80 px-6 text-sm font-bold text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:border-border hover:bg-white sm:w-auto" variant="ghost"
              >
                <ArrowLeft className="h-4 w-4" />
                Change answers
              </Button>
            ) : null}
            <Button
              type="button"
              onClick={onSubmit}
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-8 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/95 hover:shadow-xl hover:shadow-primary/30 sm:w-auto" variant="ghost"
            >
              {submitLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Answer List */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid gap-6">
          {items.map(({ question, answerValue }, index) => (
            <div key={question.id} className="relative rounded-[28px] border border-border/60 bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-8 transition-all hover:shadow-md">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/5 text-base font-bold text-primary">
                  {index + 1}
                </span>
                <div className="flex-1 space-y-4">
                  <p className="text-lg font-semibold leading-relaxed text-primary pt-1">{question.question}</p>
                  
                  <div className="rounded-2xl border border-border/50 bg-primary/[0.02] p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-primary/50 mb-2">
                      Selected answer
                    </p>
                    <p className="text-base font-medium text-primary leading-relaxed">
                      {getAnswerResponseText(question, answerValue) || <span className="italic text-primary/40">No answer provided</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
