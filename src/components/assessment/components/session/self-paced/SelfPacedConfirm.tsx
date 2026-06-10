import { ArrowLeft, ArrowRight } from "lucide-react";
import type { QuestionRendererValue } from "../../renderers/types";
import type { QuestionRound } from "../session.types";
import { getAnswerResponseText } from "../session.utils";
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
    <div className="mx-auto max-w-5xl">
      <div className="rt-card-pop rounded-[30px] border border-[#1C5C45]/20 bg-[linear-gradient(160deg,#16352A_0%,#214E3C_42%,#277DA1_100%)] p-5 text-white shadow-[0_24px_60px_rgba(22,53,42,0.22)] sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Confirmation</p>
          <h2 className="mt-2 text-2xl font-bold">Review selected answers</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
            Check the final answer sheet before locking your submission.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          {allowGoingBack ? (
            <Button
              type="button"
              onClick={onBack}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10" variant="ghost"
            >
              <ArrowLeft className="h-4 w-4" />
              Change answers
            </Button>
          ) : null}
          <Button
            type="button"
            onClick={onSubmit}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#FFD166_0%,#F9C74F_100%)] px-5 py-3 text-sm font-semibold text-primary transition hover:scale-[1.01]" variant="ghost"
          >
            {submitLabel}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {items.map(({ question, answerValue }, index) => (
          <div key={question.id} className="rt-join-card rounded-[28px] border border-border bg-white/90 p-5 shadow-sm">
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
