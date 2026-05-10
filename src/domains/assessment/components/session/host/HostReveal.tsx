import { Clock3 } from "lucide-react";
import { QuestionRenderer } from "../../renderers/QuestionRenderer";
import type { QuestionRound } from "../session.types";

export function HostReveal({
  timerSeconds,
  responseCount,
  participantsCount,
  questionIndex,
  roundsCount,
  currentRound,
  onSkip,
}: {
  timerSeconds: number;
  responseCount: number;
  participantsCount: number;
  questionIndex: number;
  roundsCount: number;
  currentRound: QuestionRound;
  onSkip: () => void;
}) {
  return (
    <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
      <div className="grid gap-4 lg:grid-cols-2">
        <div
          className={`rounded-3xl border border-border bg-[linear-gradient(135deg,#16352A_0%,#24513D_100%)] p-4 text-white shadow-sm ${
            timerSeconds <= 5 ? "rt-timer-critical" : "rt-card-pop"
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Timer</p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="text-4xl font-black">{timerSeconds}s</p>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
              {timerSeconds <= 5 ? "Final countdown" : "Live answering"}
            </p>
          </div>
          <div className="rt-progress-shimmer mt-3 h-2.5 rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition ${
                timerSeconds <= 5
                  ? "bg-[linear-gradient(90deg,#FF6B6F_0%,#F94144_100%)]"
                  : "bg-[linear-gradient(90deg,#4CC9F0_0%,#7FE0C0_100%)]"
              }`}
              style={{ width: `${(timerSeconds / 15) * 100}%` }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">Responses received</p>
          <p className="mt-2 text-4xl font-bold text-primary">
            {responseCount}/{participantsCount}
          </p>
          <p className="mt-2 text-sm leading-6 text-inkd">Live response wave is building while the room races the clock.</p>
        </div>
      </div>

      <div className="rt-card-pop flex-1 rounded-[30px] border border-[#FFD166]/55 bg-[linear-gradient(135deg,#FFF6CC_0%,#FFE7B8_42%,#FFF9E1_100%)] p-5 shadow-sm lg:flex lg:min-h-0 lg:flex-col lg:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
              Question {questionIndex + 1} of {roundsCount}
            </p>
            <h2 className="mt-2 max-w-5xl text-3xl font-bold leading-tight text-primary lg:text-4xl">
              {currentRound.question}
            </h2>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/75 px-3 py-1 text-xs font-semibold text-primary shadow-sm">
            <Clock3 className="h-4 w-4" />
            Timer auto-started
          </div>
        </div>

        <div className="mt-5 lg:min-h-0 lg:flex-1">
          <QuestionRenderer question={currentRound} value={null} disabled readOnly onChange={() => undefined} />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={onSkip}
            className="rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
          >
            Skip to correct answer
          </button>
          <div className="rounded-2xl bg-white/70 px-5 py-3 text-sm font-semibold text-primary shadow-sm">
            Live response wave and streak race in progress
          </div>
        </div>
      </div>
    </div>
  );
}
