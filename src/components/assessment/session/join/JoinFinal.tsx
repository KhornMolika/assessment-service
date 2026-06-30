import Avatar from "boring-avatars";
import { Trophy } from "lucide-react";
import { getAvatarColors, getAvatarVariant } from '@/src/lib/session/avatar.utils';

export function JoinFinal({
  displayName,
  totalScore,
  rank = "#4",
  streakCount,
}: {
  displayName: string;
  totalScore: number;
  rank?: string;
  streakCount: number;
}) {
  const avatarSeed = displayName || "Participant";

  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-1 items-center justify-center px-1 sm:px-0">
      <div className="rt-card-pop w-full rounded-[36px] border border-border bg-[linear-gradient(180deg,#FFFFFF_0%,#F6F3EA_100%)] p-7 text-center shadow-sm sm:p-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-[#D8F3DC] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          <Trophy className="h-4 w-4" />
          Final
        </div>

        <div className="mt-6 flex justify-center">
          <div className="rounded-[28px] bg-white p-2 shadow-[0_18px_40px_rgba(27,67,50,0.08)] ring-1 ring-border/70">
            <Avatar
              size={88}
              name={avatarSeed}
              variant={getAvatarVariant(avatarSeed)}
              colors={getAvatarColors(avatarSeed)}
            />
          </div>
        </div>

        <h2 className="mt-5 text-3xl font-bold text-primary">{avatarSeed}</h2>
        <p className="mt-2 text-sm leading-6 text-inkd">Session complete</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-1">
          <div className="rounded-[24px] border border-border bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
              Total score
            </p>
            <p className="mt-3 text-3xl font-black text-primary">{totalScore}</p>
          </div>
        </div>

        {streakCount >= 2 ? (
          <div className="mt-4 inline-flex items-center rounded-full bg-[#FFF1C8] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Streak x{streakCount}
          </div>
        ) : null}
      </div>
    </div>
  );
}
