import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { QuestionRound } from "../session.types";
import { Button } from "@/src/components/ui/ui/button";

export function HostCorrect({
  currentRound,
  responseDistribution,
  onNext,
}: {
  currentRound: QuestionRound;
  responseDistribution: { optionId: string; count: number }[];
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#43AA8B_0%,#7FE0C0_100%)] px-3 py-1 text-xs font-semibold text-white shadow-sm">
            <CheckCircle2 className="h-4 w-4" />
            Correct answer
          </div>
          <h2 className="mt-4 max-w-4xl text-2xl font-bold text-primary">{currentRound.question}</h2>
        </div>
        <Button
          type="button"
          onClick={onNext}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 rounded-[30px] border border-border bg-white p-4 shadow-sm sm:p-5">
        <div className="grid h-full min-h-80 grid-cols-4 items-stretch gap-3 rounded-3xl bg-[linear-gradient(180deg,#F8FBF7_0%,#EEF5F1_100%)] p-4 sm:gap-4 sm:p-5">
          {currentRound.options.map((option, index) => {
            const distribution = responseDistribution.find((item) => item.optionId === option.id)?.count ?? 0;
            const maxCount = Math.max(...responseDistribution.map((item) => item.count), 1);
            const heightPercent = maxCount > 0 ? Math.max(18, Math.round((distribution / maxCount) * 100)) : 18;
            const isCorrect = option.id === currentRound.correctOptionId;
            const paletteClassName = [
              "from-[#F94144] to-[#FF6B6F]",
              "from-[#277DA1] to-[#4CC9F0]",
              "from-[#F9C74F] to-[#FFD166]",
              "from-[#43AA8B] to-[#7FE0C0]",
            ][index % 4];

            return (
              <div key={option.id} className="flex h-full min-w-0 flex-col items-center gap-3">
                <div className="shrink-0 text-lg font-bold text-primary">{distribution}</div>
                <div className="flex min-h-0 flex-1 w-full items-end justify-center">
                  <div
                    className={`rt-bar-grow flex w-full max-w-32 flex-col justify-end rounded-t-3xl bg-linear-to-t ${paletteClassName} px-3 py-4 text-center shadow-[0_16px_30px_rgba(27,67,50,0.12)] ${
                      isCorrect ? "ring-4 ring-[#D8F7EC]" : ""
                    }`}
                    style={{ height: `${heightPercent}%`, animationDelay: `${index * 90}ms` }}
                  >
                    {isCorrect ? (
                      <span className="mb-2 inline-flex self-center rounded-full bg-white/80 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                        Correct
                      </span>
                    ) : null}
                    <span className={`text-sm font-black ${index === 2 ? "text-primary" : "text-white"}`}>
                      {option.label}
                    </span>
                  </div>
                </div>
                <p className="line-clamp-3 min-h-15 shrink-0 text-center text-sm font-semibold leading-5 text-primary">
                  {option.text}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
