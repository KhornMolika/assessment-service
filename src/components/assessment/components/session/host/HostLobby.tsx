import Avatar from "boring-avatars";
import { Copy, PlayCircle, QrCode, Radio, Volume2, VolumeX } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type { RealtimeParticipant } from "../session.types";
import { getAvatarColors, getAvatarVariant } from "../avatar.utils";
import { Button } from "@/src/components/ui/ui/button";

export function HostLobby({
  embedded,
  assessmentTitle,
  participantUrl,
  copied,
  onCopyLink,
  onStart,
  participants,
  roundsCount,
  soundEnabled,
  onToggleSound,
}: {
  embedded?: boolean;
  assessmentTitle: string;
  participantUrl: string;
  copied: boolean;
  onCopyLink: () => void;
  onStart: () => void;
  participants: RealtimeParticipant[];
  roundsCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
}) {
  return (
    <div
      className={`grid gap-5 ${
        embedded ? "2xl:h-full 2xl:grid-cols-[22rem_minmax(0,1fr)]" : "xl:h-full xl:grid-cols-[30rem_minmax(0,1fr)]"
      }`}
    >
      <div className="rt-card-pop rounded-[30px] border border-[#1C5C45]/20 bg-[linear-gradient(180deg,#16352A_0%,#214E3C_100%)] p-5 text-white shadow-[0_24px_60px_rgba(22,53,42,0.22)]">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
          <QrCode className="h-4 w-4 text-[#95D5B2]" />
          Lobby
        </div>
        <h2 className="mt-4 text-2xl font-bold leading-tight">Ask participants to scan this QR code to join</h2>
        <p className="mt-3 text-sm leading-6 text-white/75">
          Open their phone camera, scan the code, enter a display name, and wait in the lobby until host start sthe session.
        </p>
        <div className="mt-5 rt-floating flex items-center justify-center rounded-[28px] bg-white p-4">
          <QRCodeSVG
            value={participantUrl}
            title={`Join ${assessmentTitle}`}
            size={180}
            bgColor="#FFFFFF"
            fgColor="#16352A"
          />
        </div>
        <div className="mt-5 space-y-3">
          <div className="break-all rounded-2xl bg-white/5 p-4 text-sm text-white/80">{participantUrl}</div>
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onCopyLink}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10" variant="ghost"
            >
              <Copy className="h-4 w-4" />
              {copied ? "Copied" : "Copy link"}
            </Button>
            <Button
              type="button"
              onClick={onStart}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#FFD166_0%,#F9C74F_100%)] px-4 py-3 text-sm font-semibold text-primary transition hover:scale-[1.01]" variant="ghost"
            >
              <PlayCircle className="h-4 w-4" />
              Start
            </Button>
          </div>
        </div>
      </div>

      <div className="rt-card-pop rounded-[30px] border border-border bg-white/80 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">Participants joined</p>
            <h2 className="mt-2 text-2xl font-bold text-primary">{participants.length} in lobby</h2>
            <p className="mt-2 text-sm leading-6 text-inkd">New participants appear here as soon as they join the room.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              onClick={onToggleSound}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-primary transition hover:border-primary/35"
              aria-label={soundEnabled ? "Mute sound" : "Unmute sound"} variant="ghost"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary ring-1 ring-border">
              <Radio className="h-4 w-4" />
              WAITING state
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-[linear-gradient(135deg,#F94144_0%,#FF6B6F_100%)] p-4 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">Questions</p>
            <p className="mt-2 text-2xl font-bold">{roundsCount}</p>
          </div>
          <div className="rt-join-glow rounded-2xl border border-border bg-[linear-gradient(135deg,#277DA1_0%,#4CC9F0_100%)] p-4 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Ready to start</p>
            <p className="mt-2 text-lg font-bold">
              {participants.filter((participant) => participant.status === "READY").length} ready now
            </p>
          </div>
        </div>

        <div className={`mt-6 grid gap-3 ${embedded ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"}`}>
          {participants.map((participant, index) => (
            <div
              key={participant.id}
              className={`rt-join-card rounded-3xl border border-border bg-white p-4 shadow-sm transition ${index < 2 ? "rt-card-pop" : ""}`}
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl shadow-sm ring-1 ring-border/60">
                  <Avatar
                    size={48}
                    name={`${participant.id}-${participant.name}`}
                    variant={getAvatarVariant(`${participant.id}-${participant.name}`)}
                    colors={getAvatarColors(`${participant.id}-${participant.name}`)}
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-primary">{participant.name}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                    {participant.status}
                  </p>
                </div>
              </div>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${
                    participant.status === "READY"
                      ? "bg-[linear-gradient(90deg,#43AA8B_0%,#7FE0C0_100%)]"
                      : participant.status === "CONNECTED"
                        ? "bg-[linear-gradient(90deg,#277DA1_0%,#4CC9F0_100%)]"
                        : "bg-[linear-gradient(90deg,#F9C74F_0%,#FFD166_100%)]"
                  }`}
                  style={{
                    width:
                      participant.status === "READY" ? "100%" : participant.status === "CONNECTED" ? "72%" : "48%",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
