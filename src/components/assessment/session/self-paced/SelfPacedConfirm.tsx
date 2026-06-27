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
    <div className="flex h-full w-full flex-col">
      {/* Clean Header */}
      <div className="shrink-0 flex flex-col gap-6 border-b border-border/50 pb-8 pt-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center rounded-full bg-primary/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary/60">
            Final Step
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">Review Answers</h2>
          <p className="mt-2 text-sm text-primary/60">
            Check your final answer sheet before locking your submission.
          </p>
        </div>
        
        <div className="flex flex-col gap-3 sm:flex-row shrink-0">
          {allowGoingBack ? (
            <Button
              type="button"
              onClick={onBack}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border-2 border-border/60 bg-transparent px-5 text-sm font-bold text-primary transition-all hover:border-primary/20 hover:bg-primary/5 sm:w-auto" variant="ghost"
            >
              <ArrowLeft className="h-4 w-4" />
              Change answers
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

      {/* Clean List */}
      <div className="flex-1 overflow-y-auto pt-2">
        <div className="divide-y divide-border/40">
          {items.map(({ question, answerValue }, index) => (
            <div key={question.id} className="group flex flex-col gap-2 py-6 sm:flex-row sm:gap-6">
              <div className="flex shrink-0 items-center gap-2 sm:w-16 sm:flex-col sm:items-start sm:gap-1 text-primary/30">
                <span className="text-sm font-bold">Q{index + 1}</span>
              </div>
              
                <div className="flex-1 space-y-2">
                  <div>
                    <p className="text-base font-semibold leading-relaxed text-primary">{question.question}</p>
                    {question.type.toLowerCase().includes("fill") && question.rawOptions?.template ? (
                      <p className="mt-1 text-sm font-medium leading-relaxed text-primary/70">{question.rawOptions.template}</p>
                    ) : null}
                  </div>
                  <div className="text-base text-primary/70 bg-primary/[0.02] rounded-xl p-4 border border-border/40">
                    {getAnswerResponseText(question, answerValue) || <span className="italic text-primary/40">No answer provided</span>}
                  </div>
                </div>
            </div>
          ))}
        </div>
        
        <div className="py-12 text-center text-sm font-medium text-primary/40">
          End of answer sheet
        </div>
      </div>
    </div>
  );
}
