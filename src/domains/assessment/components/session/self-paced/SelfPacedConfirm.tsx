import { ArrowLeft, ArrowRight } from "lucide-react";
import type { QuestionRendererValue } from "../../renderers/types";
import type { QuestionRound } from "../session.types";
import { getAnswerResponseText } from "../session.utils";

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
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">Confirmation</p>
          <h2 className="mt-2 text-2xl font-bold text-primary">Review selected answers</h2>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {allowGoingBack ? (
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Change answers
            </button>
          ) : null}
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          >
            {submitLabel}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {items.map(({ question, answerValue }, index) => (
          <div key={question.id} className="rounded-[28px] border border-border bg-muted/20 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
              Question {index + 1}
            </p>
            <p className="mt-2 text-base font-semibold text-primary">{question.question}</p>
            <div className="mt-4 rounded-2xl bg-white p-4 ring-1 ring-border">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                Selected answer
              </p>
              <p className="mt-2 text-sm text-inkd">{getAnswerResponseText(question, answerValue)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
