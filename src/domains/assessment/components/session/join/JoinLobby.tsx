import { ArrowRight, Users, Zap } from "lucide-react";

export function JoinLobby({
  displayName,
  onDisplayNameChange,
  onJoin,
  eventName,
}: {
  displayName: string;
  onDisplayNameChange: (value: string) => void;
  onJoin: () => void;
  eventName?: string;
}) {
  return (
    <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-center xl:grid-cols-[minmax(0,1fr)_24rem]">
      <div className="max-w-2xl lg:pr-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#4CC9F0_0%,#277DA1_100%)] px-3 py-1 text-xs font-semibold text-white shadow-sm">
          <Users className="h-4 w-4" />
          Real-time lobby
        </div>
        <h2 className="mt-4 text-3xl font-bold text-primary">Join the live session</h2>
        <p className="mt-3 text-sm leading-6 text-inkd">
          Enter a display name to join. After that, wait for the host to start the session.
        </p>
        <div className="mt-6 grid gap-3">
          <div className="rounded-2xl border border-border bg-[linear-gradient(135deg,#F9C74F_0%,#FFD166_100%)] p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                Bonus in play
              </p>
            </div>
            <p className="mt-2 text-sm font-semibold text-primary">
              Fastest correct answer earns extra points.
            </p>
          </div>
        </div>
      </div>

      <div className="rt-card-pop w-full rounded-[30px] border border-border bg-white/85 p-5 shadow-sm sm:p-6 lg:max-w-none lg:self-stretch lg:flex lg:flex-col lg:justify-center xl:min-h-[24rem]">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-primary">Display name</span>
          <input
            type="text"
            value={displayName}
            onChange={(event) => onDisplayNameChange(event.target.value)}
            placeholder="Enter your display name"
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-primary"
          />
        </label>
        <div className="mt-4 rounded-2xl border border-border bg-muted/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
            Next step
          </p>
          <p className="mt-2 text-sm leading-6 text-inkd">Waiting for host to start...</p>
        </div>
        <button
          type="button"
          data-flow-event={eventName}
          disabled={displayName.trim().length === 0}
          onClick={onJoin}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#F94144_0%,#FF6B6F_100%)] px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Join lobby
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
