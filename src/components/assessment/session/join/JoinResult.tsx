import { CheckCircle2, Clock3, Sparkles, XCircle } from "lucide-react";
import type { QuestionRendererValue } from "../../renderers/types";
import type { QuestionRound } from '@/src/types/session.types';
import { getAnswerResponseText, hasAnswerResponse, isSubjectiveQuestion } from '@/src/lib/session/session.utils';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Button } from "@/src/components/ui/ui/button";

export function JoinResult({
  currentRound,
  answerValue,
  isCorrect,
  lastPoints,
  totalScore,
  speedBonus,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  const isSubjective = isSubjectiveQuestion(currentRound.type);
  const ResultIcon = isSubjective ? CheckCircle2 : isCorrect ? CheckCircle2 : XCircle;
  const safeLastPoints = formatScore(lastPoints);
  const safeTotalScore = formatScore(totalScore);
  const safeSpeedBonus = formatScore(speedBonus);

  return (
    <div className="mx-auto flex h-full w-full max-w-5xl flex-1 items-start py-2 sm:py-4 lg:items-center">
      <div className="grid w-full gap-5 max-w-3xl mx-auto lg:items-center">
        <div
          className={`overflow-hidden rounded-[32px] border shadow-[0_24px_60px_rgba(27,67,50,0.12)] ${
            isSubjective || isCorrect
              ? "border-[#43AA8B]/25 bg-[linear-gradient(180deg,#FFFEF8_0%,#F0F8F2_100%)] dark:bg-card dark:bg-none text-primary"
              : "border-[#F94144]/20 bg-[linear-gradient(180deg,#FFF8F5_0%,#FFEDEC_100%)] dark:bg-card dark:bg-none text-primary"
          }`}
        >
          <div className="border-b border-[#1C5C45]/10 p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ${
                    isSubjective || isCorrect
                      ? "bg-[#D8F3DC] text-primary"
                      : "bg-[#FFE1DF] text-[#9F1C21]"
                  }`}
                >
                  <ResultIcon className="h-4 w-4" />
                  Round result
                </div>
                <h2 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">
                  {isSubjective ? "Response submitted" : isCorrect ? "Correct" : "Not quite"}
                </h2>
              </div>
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-3xl ${
                  isSubjective || isCorrect ? "bg-[#D8F3DC] text-primary" : "bg-[#FFE1DF] text-[#9F1C21]"
                }`}
              >
                <ResultIcon className="h-8 w-8" />
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-[#1C5C45]/10 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                Your answer
              </p>
              <p className="mt-2 text-lg font-bold text-primary">
                {hasAnswerResponse(currentRound, answerValue)
                  ? getAnswerResponseText(currentRound, answerValue)
                  : "Timer ended before a choice was submitted."}
              </p>
            </div>
          </div>

          <div className="grid gap-3 p-6 sm:grid-cols-3 sm:p-7">
            {!isSubjective && (
              <div className="rounded-3xl border border-[#1C5C45]/10 bg-white p-4 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/50">
                  Points earned
                </p>
                <p className="mt-3 text-4xl font-black text-primary">{safeLastPoints}</p>
              </div>
            )}
            <div className="rounded-3xl border border-[#1C5C45]/10 bg-white p-4 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/50">
                Total score
              </p>
              <p className="mt-3 text-4xl font-black text-primary">{safeTotalScore}</p>
            </div>
            {!isSubjective && (
              <div className="rounded-3xl border border-[#FFD166]/60 bg-[#FFF6CC] p-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary/60">
                    Speed bonus
                  </p>
                </div>
                <p className="mt-3 text-4xl font-black text-primary">
                  {isCorrect ? safeSpeedBonus : 0}
                </p>
              </div>
            )}
          </div>
        </div>


      </div>
    </div>
  );
}

function formatScore(value: number): string {
  if (!Number.isFinite(value)) return "0";
  const rounded = Math.round(value * 100) / 100;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2);
}
