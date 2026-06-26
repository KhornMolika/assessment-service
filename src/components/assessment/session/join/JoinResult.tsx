import { ArrowRight } from "lucide-react";
import type { QuestionRendererValue } from "../../renderers/types";
import type { QuestionRound } from '@/src/types/session.types';
import { getAnswerResponseText, hasAnswerResponse } from '@/src/lib/session/session.utils';
import { Button } from "@/src/components/ui/ui/button";

export function JoinResult({
  currentRound,
  answerValue,
  isCorrect,
  lastPoints,
  totalScore,
  speedBonus,
  isLastQuestion,
}: {
  currentRound: QuestionRound;
  answerValue: QuestionRendererValue;
  isCorrect: boolean;
  lastPoints: number;
  totalScore: number;
  speedBonus: number;
  isLastQuestion: boolean;
}) {
  return (
    <div className="mx-auto flex h-full w-full max-w-4xl flex-1 items-start py-2 sm:py-4 lg:items-center">
      <div className="grid w-full gap-4 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center xl:gap-5">
        <div
          className={`rounded-[30px] border p-6 shadow-sm sm:p-7 ${
            isCorrect
              ? "border-[#43AA8B]/25 bg-[linear-gradient(135deg,#16352A_0%,#24513D_100%)] text-white"
              : "border-[#F94144]/20 bg-[linear-gradient(135deg,#6F1D1B_0%,#B02A37_100%)] text-white"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
            Round result
          </p>
          <h2 className="mt-3 text-3xl font-bold">{isCorrect ? "Correct" : "Wrong"}</h2>
          <p className="mt-3 text-sm leading-6 text-white/75">
            {hasAnswerResponse(answerValue)
              ? getAnswerResponseText(currentRound, answerValue)
              : "Timer ended before a choice was submitted."}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Points earned</p>
              <p className="mt-2 text-2xl font-bold">{lastPoints}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Total score</p>
              <p className="mt-2 text-2xl font-bold">{totalScore}</p>
            </div>
          </div>
          {speedBonus > 0 ? (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">Speed bonus</p>
              <p className="mt-2 text-2xl font-bold">{isCorrect ? speedBonus : 0}</p>
            </div>
          ) : null}
        </div>

        <div className="space-y-4 lg:self-end">
          <div className="rounded-[28px] border border-border bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
              Status
            </p>
            <p className="mt-2 text-lg font-bold text-primary">Wait for host to advance</p>
            <p className="mt-2 text-sm leading-6 text-inkd">
              The next question appears only after the host moves the session forward.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
