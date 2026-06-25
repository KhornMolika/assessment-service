"use client";

import Avatar from "boring-avatars";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Copy,
  Crown,
  PlayCircle,
  QrCode,
  Radio,
  Trophy,
  Volume2,
  VolumeX,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type {
  AssessmentCatalogItem,
  AssessmentDetailQuestionItem,
} from "@/src/types";
import { QuestionRenderer } from "../renderers/QuestionRenderer";
import { ScreenShell } from "./SessionShared";
import { getAvatarColors, getAvatarVariant } from "./avatar.utils";
import { useRealtimeAudio } from "./realtime.effects";
import { realtimeEvents } from "./realtime.events";
import type { HostPhase } from "./session.types";
import {
  buildDistribution,
  buildLeaderboard,
  buildParticipantRoster,
  buildQuestionRounds,
  resolveLeaderboardRound,
} from "./session.utils";
import { Button } from "@/src/components/ui/ui/button";
import { useRealtimeSession } from "@/src/hooks/use-realtime-session";
import { RoomRole } from "@/src/types/runtime.types";
import { startRealtimeSessionHost } from "@/src/lib/actions/runtime.actions";
import { toast } from "sonner";

export function AssessmentHostScreen({
  assessment,
  questions,
  embedded,
}: {
  assessment: AssessmentCatalogItem;
  questions: AssessmentDetailQuestionItem[];
  embedded?: boolean;
}) {
  const rounds = useMemo(() => buildQuestionRounds(questions), [questions]);
  const [copied, setCopied] = useState(false);
  const [phase, setPhase] = useState<HostPhase>("lobby");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [origin, setOrigin] = useState("");
  const previousTimerRef = useRef(timerSeconds);
  const previousPhaseRef = useRef<HostPhase>(phase);
  const { soundEnabled, setSoundEnabled, prime, playTone } = useRealtimeAudio();

  const { isConnected, roomState, joinRoom, emitStartQuestion, emitRevealAnswers } = useRealtimeSession();

  const participants = useMemo(() => buildParticipantRoster(), []);
  const initialLeaderboard = useMemo(() => buildLeaderboard(), []);

  const activeParticipants = roomState.participants.length > 0 ? roomState.participants : participants; // Fallback to mock if empty
  const [mockResponseCount, setMockResponseCount] = useState(0);
  const responseCount = roomState.questionResults ? activeParticipants.length : mockResponseCount;
  
  const leaderboard = roomState.leaderboard || initialLeaderboard;

  useEffect(() => {
    // Start session as host on mount
    async function initHost() {
      const res = await startRealtimeSessionHost(assessment.id);
      if (res.success) {
        joinRoom(assessment.id, RoomRole.HOST);
      } else {
        toast.error("Failed to initialize host session on backend");
      }
    }
    initHost();
  }, [assessment.id, joinRoom]);

  const currentRound = rounds[questionIndex];
  const participantPath = `/assessments/${assessment.id}/join`;
  const participantUrl = origin ? `${origin}${participantPath}` : participantPath;
  const responseDistribution = useMemo(
    () => {
      // If we have actual results from backend, map them
      if (roomState.questionResults) {
        // Map backend results to distribution, for now fallback to mock
        return buildDistribution(currentRound.options, responseCount, currentRound.correctOptionId);
      }
      return buildDistribution(currentRound.options, responseCount, currentRound.correctOptionId);
    },
    [currentRound, responseCount, roomState.questionResults],
  );
  const isLobbyPhase = phase === "lobby";

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setOrigin(window.location.origin);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  useEffect(() => {
    if (phase !== "reveal") {
      return;
    }

    if (timerSeconds <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (timerSeconds <= 1) {
        setMockResponseCount(activeParticipants.length);
        setPhase("correct");
        emitRevealAnswers();
        return;
      }

      setTimerSeconds((seconds) => seconds - 1);
      setMockResponseCount((count) => Math.min(activeParticipants.length, count + 1));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [activeParticipants.length, phase, timerSeconds, emitRevealAnswers]);

  useEffect(() => {
    if (previousPhaseRef.current !== phase) {
      if (phase === "reveal") {
        void playTone("reveal");
      } else if (phase === "correct") {
        void playTone("success");
      } else if (phase === "leaderboard") {
        void playTone("leaderboard");
      }
    }

    previousPhaseRef.current = phase;
  }, [phase, playTone]);

  useEffect(() => {
    if (phase !== "reveal" || previousTimerRef.current === timerSeconds) {
      previousTimerRef.current = timerSeconds;
      return;
    }

    if (timerSeconds > 0) {
      void playTone(timerSeconds <= 5 ? "warning" : "tick");
    }

    previousTimerRef.current = timerSeconds;
  }, [phase, playTone, timerSeconds]);

  function startSession() {
    prime();
    setQuestionIndex(0);
    setTimerSeconds(15);
    setMockResponseCount(0);
    setPhase("reveal");
    emitStartQuestion(rounds[0].id);
  }

  function skipToCorrectAnswer() {
    setTimerSeconds(0);
    setMockResponseCount(activeParticipants.length);
    setPhase("correct");
    emitRevealAnswers();
  }

  function showLeaderboard() {
    setPhase("leaderboard");
  }

  function advanceToNextQuestion() {
    if (questionIndex === rounds.length - 1) {
      setPhase("winner");
      return;
    }

    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);
    setTimerSeconds(15);
    setMockResponseCount(0);
    setPhase("reveal");
    emitStartQuestion(rounds[nextIndex].id);
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(participantUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <ScreenShell
      eyebrow={isLobbyPhase ? "Real-time Host Flow" : ""}
      title={isLobbyPhase ? assessment.name || "Untitled" : ""}
      description={isLobbyPhase ? assessment.description ?? "" : ""}
      variant={embedded ? "panel" : "page"}
      aside={null}
    >
      <div className="lg:h-full">
        {phase === "lobby" ? (
          <div
            className={`grid gap-5 ${
              embedded
                ? "2xl:h-full 2xl:grid-cols-[22rem_minmax(0,1fr)]"
                : "xl:h-full xl:grid-cols-[30rem_minmax(0,1fr)]"
            }`}
          >
            <div className="rt-card-pop rounded-[30px] border border-[#1C5C45]/20 bg-[linear-gradient(180deg,#16352A_0%,#214E3C_100%)] p-5 text-white shadow-[0_24px_60px_rgba(22,53,42,0.22)]">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
                <QrCode className="h-4 w-4 text-[#95D5B2]" />
                Lobby
              </div>
              <h2 className="mt-4 text-2xl font-bold leading-tight">Ask participants to scan this QR code to join</h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Open their phone camera, scan the code, enter a display name, and wait in the lobby
                until host start sthe session.
              </p>
              <div className="mt-5 rt-floating flex items-center justify-center rounded-[28px] bg-white p-4">
                <QRCodeSVG
                  value={participantUrl}
                  title={`Join ${assessment.name}`}
                  size={180}
                  bgColor="#FFFFFF"
                  fgColor="#16352A"
                />
              </div>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-white/5 p-4 text-sm text-white/80 break-all">
                  {participantUrl}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button
                    type="button"
                    onClick={() => void handleCopyLink()}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10" variant="ghost"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy link"}
                  </Button>
                  <Button
                    type="button"
                    data-flow-event={realtimeEvents.startQuestion}
                    onClick={startSession}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#FFD166_0%,#F9C74F_100%)] px-4 py-3 text-sm font-semibold text-primary transition hover:scale-[1.01]" variant="ghost"
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
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                    Participants joined
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-primary">{participants.length} in lobby</h2>
                  <p className="mt-2 text-sm leading-6 text-inkd">
                    New participants appear here as soon as they join the room.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={() => setSoundEnabled((enabled) => !enabled)}
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
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                    Questions
                  </p>
                  <p className="mt-2 text-2xl font-bold">{rounds.length}</p>
                </div>
                <div className="rt-join-glow rounded-2xl border border-border bg-[linear-gradient(135deg,#277DA1_0%,#4CC9F0_100%)] p-4 text-white shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                    Ready to start
                  </p>
                  <p className="mt-2 text-lg font-bold">{participants.filter((participant) => participant.status === "READY").length} ready now</p>
                </div>
              </div>

              <div
                className={`mt-6 grid gap-3 ${
                  embedded ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3"
                }`}
              >
                {participants.map((participant, index) => (
                  <div
                    key={participant.id}
                    className={`rt-join-card rounded-3xl border border-border bg-white p-4 shadow-sm transition ${
                      index < 2 ? "rt-card-pop" : ""
                    }`}
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
                        style={{ width: participant.status === "READY" ? "100%" : participant.status === "CONNECTED" ? "72%" : "48%" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {phase === "reveal" ? (
          <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
            <div className="grid gap-4 lg:grid-cols-2">
              <div
                className={`rounded-3xl border border-border bg-[linear-gradient(135deg,#16352A_0%,#24513D_100%)] p-4 text-white shadow-sm ${
                  timerSeconds <= 5 ? "rt-timer-critical" : "rt-card-pop"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Timer
                </p>
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
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                  Responses received
                </p>
                <p className="mt-2 text-4xl font-bold text-primary">
                  {responseCount}/{participants.length}
                </p>
                <p className="mt-2 text-sm leading-6 text-inkd">Live response wave is building while the room races the clock.</p>
              </div>
            </div>

            <div className="rt-card-pop flex-1 rounded-[30px] border border-[#FFD166]/55 bg-[linear-gradient(135deg,#FFF6CC_0%,#FFE7B8_42%,#FFF9E1_100%)] p-5 shadow-sm lg:flex lg:min-h-0 lg:flex-col lg:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                    Question {questionIndex + 1} of {rounds.length}
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
                <QuestionRenderer
                  question={currentRound}
                  value={null}
                  disabled
                  readOnly
                  onChange={() => undefined}
                />
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button
                  type="button"
                  data-flow-event={realtimeEvents.questionResults}
                  onClick={skipToCorrectAnswer}
                  className="rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted" variant="secondary"
                >
                  Skip to correct answer
                </Button>
                <div className="rounded-2xl bg-white/70 px-5 py-3 text-sm font-semibold text-primary shadow-sm">
                  Live response wave and streak race in progress
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {phase === "correct" ? (
          <div className="flex flex-col gap-4 lg:h-full lg:min-h-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#43AA8B_0%,#7FE0C0_100%)] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  Correct answer
                </div>
                <h2 className="mt-4 max-w-4xl text-2xl font-bold text-primary">
                  {currentRound.question}
                </h2>
              </div>
              <Button
                type="button"
                data-flow-event={realtimeEvents.showRank}
                onClick={showLeaderboard}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="min-h-0 flex-1 rounded-[30px] border border-border bg-white p-4 shadow-sm sm:p-5">
              <div className="grid h-full min-h-80 grid-cols-4 items-stretch gap-3 rounded-3xl bg-[linear-gradient(180deg,#F8FBF7_0%,#EEF5F1_100%)] p-4 sm:gap-4 sm:p-5">
                  {currentRound.options.map((option: any, index: number) => {
                    const distribution =
                      responseDistribution.find((item) => item.optionId === option.id)?.count ?? 0;
                    const maxCount = Math.max(...responseDistribution.map((item) => item.count), 1);
                    const heightPercent =
                      maxCount > 0 ? Math.max(18, Math.round((distribution / maxCount) * 100)) : 18;
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
                            className={`rt-bar-grow flex w-full max-w-32 flex-col justify-end rounded-t-3xl bg-linear-to-t ${paletteClassName} px-3 py-4 text-center shadow-[0_16px_30px_rgba(27,67,50,0.12)] ${isCorrect ? "ring-4 ring-[#D8F7EC]" : ""}`}
                            style={{
                              height: `${heightPercent}%`,
                              animationDelay: `${index * 90}ms`,
                            }}
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
        ) : null}

        {phase === "leaderboard" ? (
          <div className="flex flex-col gap-5 lg:h-full lg:min-h-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#F9C74F_0%,#FFD166_100%)] px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </div>
                <h1 className="mt-4 text-4xl font-bold text-primary">Leaderboard</h1>
              </div>
              <Button
                type="button"
                data-flow-event={questionIndex === rounds.length - 1 ? realtimeEvents.showFinalRank : realtimeEvents.startQuestion}
                onClick={advanceToNextQuestion}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#F94144_0%,#FF6B6F_100%)] px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]" variant="ghost"
              >
                {questionIndex === rounds.length - 1 ? "Show winner podium" : "Next question"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="rt-card-pop flex-1 rounded-[30px] border border-[#1C5C45]/20 bg-[linear-gradient(160deg,#16352A_0%,#214E3C_35%,#277DA1_100%)] p-4 text-white shadow-[0_24px_60px_rgba(22,53,42,0.22)] sm:p-5 lg:min-h-0 lg:p-6">
              <div className="rounded-[28px] border border-white/10 bg-white/6 p-4 backdrop-blur-sm sm:p-5 lg:flex lg:h-full lg:min-h-0 lg:flex-col">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                    Full ranking
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                    Gap to lead
                  </p>
                </div>

                <div className="mt-4 grid gap-4 lg:min-h-0 lg:flex-1 lg:auto-rows-fr">
                  {leaderboard.slice(0, 5).map((entry: any, index: number) => {
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
                                      {rankDelta > 0
                                        ? `Up ${rankDelta}`
                                        : rankDelta < 0
                                          ? `Down ${Math.abs(rankDelta)}`
                                          : "No move"}
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
        ) : null}

        {phase === "winner" ? (
          <div className="rounded-4xl border border-border bg-[radial-gradient(circle_at_top,rgba(249,199,79,0.3),transparent_30%),linear-gradient(180deg,#16352A_0%,#1E4738_55%,#245C47_100%)] p-6 text-white shadow-sm lg:flex lg:h-full lg:min-h-0 lg:flex-col lg:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
                <Crown className="h-4 w-4 text-[#FFD166]" />
                Winner podium
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight">Champion results</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
                Final standings are locked. Top 3 participants take the podium.
              </p>
            </div>

            <div className="mt-8 grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="rounded-[32px] border border-white/10 bg-white/6 p-5 backdrop-blur-sm lg:flex lg:min-h-0 lg:flex-col lg:justify-end">
                <div className="grid items-end gap-4 md:grid-cols-3">
                  {leaderboard.slice(0, 3).map((entry: any, index: number) => {
                    const place = index + 1;
                    const orderClassName =
                      place === 1 ? "md:order-2" : place === 2 ? "md:order-1" : "md:order-3";
                    const stepHeight =
                      place === 1 ? "h-56" : place === 2 ? "h-44" : "h-36";
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
                              name={`${entry.id}-${entry.name}`}
                              variant={getAvatarVariant(`${entry.id}-${entry.name}`)}
                              colors={getAvatarColors(`${entry.id}-${entry.name}`)}
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
                          {place === 1 ? (
                            <Crown className="mb-3 h-8 w-8 text-primary" />
                          ) : null}
                          <p className="text-4xl font-black">{place}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <div className="rounded-[30px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                    Session closed
                  </p>
                  <h2 className="mt-3 text-2xl font-bold">Back to assessment</h2>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    Return to the assessment detail page to review the setup or launch another session.
                  </p>

                  <Link
                    href={`/assessments/${assessment.id}`}
                    className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#F94144_0%,#FF6B6F_100%)] px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to assessment
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ScreenShell>
  );
}
