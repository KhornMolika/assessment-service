import { ArrowRight, Trophy } from "lucide-react";
import type { LeaderboardEntry } from "../session.types";
import { Button } from "@/src/components/ui/ui/button";

export function HostLeaderboard({
  leaderboard,
  isLastQuestion,
  onNext,
}: {
  leaderboard: LeaderboardEntry[];
  isLastQuestion: boolean;
  onNext: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 lg:h-full lg:min-h-0">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="w-full text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#F9C74F_0%,#FFD166_100%)] px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            <Trophy className="h-4 w-4" />
            Leaderboard
          </div>
          <h1 className="mt-4 text-4xl font-bold text-primary">Leaderboard</h1>
        </div>
        <Button
          type="button"
          onClick={onNext}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#F94144_0%,#FF6B6F_100%)] px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]" variant="ghost"
        >
          {isLastQuestion ? "Show winner podium" : "Next question"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="rt-card-pop flex-1 rounded-[30px] border border-[#1C5C45]/20 bg-[linear-gradient(160deg,#16352A_0%,#214E3C_35%,#277DA1_100%)] p-4 text-white shadow-[0_24px_60px_rgba(22,53,42,0.22)] sm:p-5 lg:min-h-0 lg:p-6">
        <div className="rounded-[28px] border border-white/10 bg-white/6 p-4 backdrop-blur-sm sm:p-5 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Full ranking</p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Gap to lead</p>
          </div>

          <div className="mt-4 grid gap-4 lg:min-h-0 lg:flex-1 lg:auto-rows-fr">
            {leaderboard.slice(0, 5).map((entry, index) => {
                  const gapToLead = Math.max(0, leaderboard[0]?.score - entry.score);
                  const rankDelta = entry.previousRank - entry.rank;

                  return (
                    <div
                      key={entry.id}
                      className={`rounded-[26px] border p-4 lg:flex lg:min-h-23 lg:flex-1 lg:items-center ${
                        index === 0
                          ? "border-[#FFD166]/35 bg-[linear-gradient(135deg,rgba(249,199,79,0.28)_0%,rgba(255,255,255,0.09)_100%)] shadow-[0_18px_40px_rgba(249,199,79,0.12)]"
                          : "border-white/10 bg-white/5"
                      }`}
                    >
                      <div className="flex w-full flex-wrap items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-primary shadow-sm">
                            {entry.rank}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">{entry.name}</p>
                            <div className="mt-1 flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                                {rankDelta > 0 ? `Up ${rankDelta}` : rankDelta < 0 ? `Down ${Math.abs(rankDelta)}` : "No move"}
                              </span>
                              {entry.streak >= 2 ? (
                                <span className="rounded-full bg-[#FFD166] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                                  Streak x{entry.streak}
                                </span>
                              ) : null}
                              {entry.lastGain > 0 ? (
                                <span className="rounded-full bg-[#43AA8B]/18 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#95D5B2]">
                                  +{entry.lastGain}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">{entry.score}</p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/55">
                            {gapToLead === 0 ? "Top" : `-${gapToLead}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
    </div>
  );
}
