import Avatar from "boring-avatars";
import { Crown } from "lucide-react";
import { BackButton } from "@/src/components/ui/navigation/BackButton";
import type { LeaderboardEntry } from '@/src/types/session.types';
import { getAvatarColors, getAvatarVariant } from '@/src/lib/session/avatar.utils';

export function HostWinner({
  leaderboard,
  assessmentId,
  embedded,
}: {
  leaderboard: LeaderboardEntry[];
  assessmentId: string;
  embedded?: boolean;
}) {
  return (
    <div className="rounded-4xl border border-border bg-[radial-gradient(circle_at_top,rgba(249,199,79,0.3),transparent_30%),linear-gradient(180deg,#16352A_0%,#1E4738_55%,#245C47_100%)] p-6 text-white shadow-sm lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:p-8">
      <div className="flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
          <Crown className="h-4 w-4 text-[#FFD166]" />
          Winner podium
        </div>
        <h1 className="mt-4 text-4xl font-black tracking-tight">Champion results</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Final standings are locked. Top 3 participants take the podium.</p>
      </div>

      <div className="mt-8 grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-[32px] border border-white/10 bg-white/6 p-5 backdrop-blur-sm lg:flex lg:min-h-0 lg:flex-col lg:justify-end">
          <div className="grid items-end gap-4 md:grid-cols-3">
            {leaderboard.slice(0, 3).map((entry, index) => {
              const place = index + 1;
              const orderClassName = place === 1 ? "md:order-2" : place === 2 ? "md:order-1" : "md:order-3";
              const stepHeight = place === 1 ? "h-56" : place === 2 ? "h-44" : "h-36";
              const stepTone =
                place === 1
                  ? "from-[#F9C74F] to-[#FFD166] text-primary"
                  : place === 2
                    ? "from-[#D9E6F2] to-[#F4F8FB] text-primary"
                    : "from-[#E8B179] to-[#F4CC9C] text-primary";

              return (
                <div
                  key={entry.id}
                  className={`flex flex-col items-center ${orderClassName}`}
                >
                  <div className="mb-4 flex flex-col items-center text-center">
                    <div className="h-16 w-16 overflow-hidden rounded-3xl ring-2 ring-white/25 shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
                      <Avatar
                        size={64}
                        name={entry.name}
                        variant={getAvatarVariant(entry.name)}
                        colors={getAvatarColors(entry.name)}
                      />
                    </div>
                    <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                      {place === 1 ? "Champion" : `Place ${place}`}
                    </p>
                    <p className="mt-2 text-xl font-bold">{entry.name}</p>
                    <p className="mt-1 text-sm font-semibold text-[#D8F3DC]">{entry.score} pts</p>
                  </div>

                  <div
                    className={`flex w-full max-w-[13rem] flex-col items-center justify-center rounded-t-[32px] bg-linear-to-t ${stepTone} ${stepHeight} shadow-[0_24px_50px_rgba(0,0,0,0.16)]`}
                  >
                    {place === 1 ? <Crown className="mb-3 h-8 w-8 text-primary" /> : null}
                    <p className="text-4xl font-black">{place}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col justify-end">
          <div className="rounded-[30px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">Session closed</p>
            <h2 className="mt-3 text-2xl font-bold">Back to assessment</h2>
            <p className="mt-3 text-sm leading-6 text-white/70">
              Return to the assessment detail page to review the setup or launch another session.
            </p>

            <BackButton
              href={embedded ? `/assessments/${assessmentId}/preview` : `/assessments/${assessmentId}`}
              label="Back to assessment"
              fullWidth
              className="mt-6 bg-[linear-gradient(135deg,#F94144_0%,#FF6B6F_100%)] hover:bg-[linear-gradient(135deg,#F94144_0%,#FF6B6F_100%)] hover:opacity-95"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
