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
import { getAvatarColors, getAvatarVariant } from '@/src/lib/session/avatar.utils';
import { useRealtimeAudio } from '@/src/lib/session/realtime.effects';
import { realtimeEvents } from '@/src/lib/session/realtime.events';
import type { HostPhase, LeaderboardEntry, QuestionOption } from '@/src/types/session.types';
import {
  buildDistribution,
  buildQuestionRounds,
  getCorrectAnswerText,
} from '@/src/lib/session/session.utils';
import { Button } from "@/src/components/ui/ui/button";
import { useRealtimeSession, type RealtimeSessionReturn } from "@/src/hooks/use-realtime-session";
import { RoomRole } from "@/src/types/runtime.types";
import { startRealtimeSessionHost } from "@/src/lib/actions/runtime.actions";
import { toast } from "sonner";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const QUESTION_DURATION_SECONDS = 30;

export function PresentRealTimeScreen({
  assessment,
  questions,
  embedded,
  session: externalSession,
  previewParticipants = [],
}: {
  assessment: AssessmentCatalogItem;
  questions: AssessmentDetailQuestionItem[];
  embedded?: boolean;
  session?: RealtimeSessionReturn;
  previewParticipants?: Array<{ id: string; name: string }>;
}) {
  const internalSession = useRealtimeSession({ enabled: !externalSession });
  const activeSession = externalSession || internalSession;
  const rounds = useMemo(() => buildQuestionRounds(questions), [questions]);
  const [copied, setCopied] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [origin, setOrigin] = useState("");
  const previousTimerRef = useRef(timerSeconds);
  const autoRevealQuestionRef = useRef<string | null>(null);
  const { soundEnabled, setSoundEnabled, prime, playTone } = useRealtimeAudio();
  const [parent] = useAutoAnimate();

  const { isConnected, roomState, joinRoom, emitStartQuestion, emitRevealAnswers } = activeSession;

  const phase = roomState.phase === "active" ? "reveal" : roomState.phase === "results" ? "winner" : roomState.phase as HostPhase;
  const previousPhaseRef = useRef<HostPhase>(phase);

  const activeParticipants: Array<{ id: string; name: string }> =
    roomState.participants.length > 0 ? roomState.participants : previewParticipants;
  const responseCount = roomState.questionResults ? (roomState.questionResults.totalAnswered || 0) : 0;
  
  const leaderboard: LeaderboardEntry[] = Array.isArray(roomState.leaderboard)
    ? roomState.leaderboard
    : [];
  const displayLeaderboard = [
    ...leaderboard,
    ...activeParticipants
      .filter((participant) =>
        !leaderboard.some((entry) => entry.id === participant.id),
      )
      .map((participant) => ({
        id: participant.id,
        name: participant.name || "Anonymous",
        score: 0,
        rank: 0,
        previousRank: 0,
        streak: 0,
        lastGain: 0,
      })),
  ].map((entry, index) => ({
    ...entry,
    rank: entry.rank || index + 1,
    previousRank: entry.previousRank || entry.rank || index + 1,
  }));
  const hasParticipants = activeParticipants.length > 0;

  // When used standalone (no external session), auto-join as host
  const hostJoinedRef = useRef(false);
  useEffect(() => {
    if (externalSession || !isConnected || hostJoinedRef.current) return;
    async function initHost() {
      const res = await startRealtimeSessionHost(assessment.id);
      if (res.success) {
        joinRoom(assessment.id, RoomRole.HOST);
        hostJoinedRef.current = true;
      } else {
        toast.error("Failed to initialize host session on backend");
      }
    }
    initHost();
  }, [externalSession, assessment.id, joinRoom, isConnected]);

  const currentRound = rounds[questionIndex];
  const participantPath = `/assessments/${assessment.id}/enter-real-time-assessment`;
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
    if (phase !== "reveal" || !roomState.endTime) return;
    
    const tick = () => {
      const remaining = Math.max(0, Math.floor((new Date(roomState.endTime!).getTime() - Date.now()) / 1000));
      setTimerSeconds(remaining);
    };
    
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [phase, roomState.endTime]);

  useEffect(() => {
    if (
      phase !== "reveal" ||
      !roomState.endTime ||
      !roomState.currentQuestion?.id
    ) {
      return;
    }

    const delay = Math.max(
      0,
      new Date(roomState.endTime).getTime() - Date.now() + 100,
    );
    const timeoutId = window.setTimeout(() => {
      if (autoRevealQuestionRef.current === roomState.currentQuestion?.id) {
        return;
      }
      autoRevealQuestionRef.current = roomState.currentQuestion.id;
      emitRevealAnswers(assessment.id);
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [
    assessment.id,
    emitRevealAnswers,
    phase,
    roomState.currentQuestion?.id,
    roomState.endTime,
  ]);

  useEffect(() => {
    if (
      phase !== "reveal" ||
      !roomState.endTime ||
      !roomState.currentQuestion?.id
    ) {
      return;
    }
    const remainingMs = new Date(roomState.endTime).getTime() - Date.now();
    if (remainingMs > 0) return;
    if (autoRevealQuestionRef.current === roomState.currentQuestion.id) return;

    autoRevealQuestionRef.current = roomState.currentQuestion.id;
    emitRevealAnswers(assessment.id);
  }, [
    assessment.id,
    emitRevealAnswers,
    phase,
    roomState.currentQuestion?.id,
    roomState.endTime,
    timerSeconds,
  ]);


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
    if (!hasParticipants) {
      toast.error("At least one participant must join before the session can start.");
      return;
    }
    prime();
    setQuestionIndex(0);
    emitStartQuestion(rounds[0].id);
  }


  
  function skipToCorrectAnswer() {
    emitRevealAnswers(assessment.id);
  }


  
  function showLeaderboard() {
    // handled by backend SHOW_RANK via automatic transition or something else? Wait, backend sends SHOW_RANK automatically after Q_RESULTS!
    // Wait, no. The host might need to explicitly request SHOW_RANK. But in backend, endQuestion automatically broadcasts SHOW_RANK.
    // So the host just needs to know they are in leaderboard phase.
  }


  
  function advanceToNextQuestion() {
    if (questionIndex === rounds.length - 1) {
      // Backend automatically sends SESSION_ENDED or SHOW_FINAL_RANK which sets phase=results
      return;
    }
    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);
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
            className={`grid h-full gap-6 ${
              embedded
                ? "2xl:grid-cols-[26rem_minmax(0,1fr)]"
                : "xl:grid-cols-[30rem_minmax(0,1fr)]"
            }`}
          >
            {/* Left Column: QR Code & Start Controls */}
            <div className="relative flex flex-col justify-between overflow-hidden rounded-[32px] border border-[#1C5C45]/15 bg-[linear-gradient(180deg,#FFFEF8_0%,#F3F8F1_100%)] p-8 text-primary shadow-[0_22px_55px_rgba(27,67,50,0.10)]">
              
              <div className="relative z-10">
                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#1C5C45]/15 bg-primary/8 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-primary">
                  <QrCode className="h-4 w-4 text-[#95D5B2]" />
                  Join Lobby
                </div>
                
                <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
                  Invite your participants to join
                </h2>
                <p className="mt-3 text-[15px] leading-relaxed text-inkd">
                  Ask participants to scan this QR code or go to the link below to enter the live session.
                </p>

                <div className="mt-10 flex items-center justify-center">
                  <div className="animate-float relative rounded-[32px] border border-[#1C5C45]/15 bg-white p-4 shadow-[0_18px_45px_rgba(27,67,50,0.12)]">
                    <div className="rounded-[24px] bg-white p-4">
                      <QRCodeSVG
                        value={participantUrl}
                        title={`Join ${assessment.name}`}
                        size={180}
                        bgColor="#FFFFFF"
                        fgColor="#113023"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-10 space-y-4">
                <div className="flex items-center justify-between rounded-2xl border border-[#1C5C45]/15 bg-white p-3 shadow-sm">
                  <span className="truncate px-2 text-sm font-medium text-primary">
                    {participantUrl}
                  </span>
                  <Button
                    type="button"
                    onClick={() => void handleCopyLink()}
                    className="ml-2 flex-shrink-0 rounded-xl bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/15"
                    variant="ghost"
                  >
                    {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                
                <Button
                  type="button"
                  data-flow-event={realtimeEvents.startQuestion}
                  onClick={startSession}
                  disabled={!hasParticipants}
                  className="group relative w-full overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#F94144_0%,#FF6B6F_100%)] px-4 py-6 text-lg font-bold text-white shadow-[0_18px_36px_rgba(249,65,68,0.20)] transition-all hover:scale-[1.02] hover:shadow-[0_22px_45px_rgba(249,65,68,0.26)] disabled:cursor-not-allowed disabled:border disabled:border-[#1C5C45]/10 disabled:bg-[linear-gradient(180deg,#F4F1EA_0%,#EAE6DC_100%)] disabled:text-primary/45 disabled:shadow-inner disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity group-hover:opacity-100 group-disabled:hidden" />
                  <PlayCircle className="mr-2 h-6 w-6" />
                  {hasParticipants ? "Start Session Now" : "Waiting for participants"}
                </Button>
              </div>
            </div>

            {/* Right Column: Participant Roster */}
            <div className="flex h-full flex-col rounded-[32px] border border-border bg-white/80 shadow-[0_18px_45px_rgba(27,67,50,0.08)] backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-border/50 px-8 py-6">
                <h3 className="text-xl font-bold text-ink">Lobby Roster</h3>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    onClick={() => setSoundEnabled((enabled) => !enabled)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-primary transition hover:border-primary/35"
                    aria-label={soundEnabled ? "Mute sound" : "Unmute sound"} variant="ghost"
                  >
                    {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                  </Button>
                  <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                    {activeParticipants.length} joined
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                {activeParticipants.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/5">
                      <Clock3 className="h-8 w-8 text-primary/40" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-ink">Waiting for participants</p>
                      <p className="text-sm text-inkd mt-1">They will appear here instantly as they join.</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {activeParticipants.map((p) => {
                      const colors = getAvatarColors(p.id);
                      return (
                        <div
                          key={p.id}
                          className="group flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-white p-4 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md animate-in fade-in zoom-in duration-300"
                        >
                          <Avatar
                            size={56}
                            name={p.id}
                            variant={getAvatarVariant(p.id)}
                            colors={colors}
                          />
                          <span className="truncate font-semibold text-ink mt-2 w-full text-center">
                            {p.name || "Anonymous"}
                          </span>
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                            Connected
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : phase === "reveal" ? (
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
                    style={{ width: `${(timerSeconds / QUESTION_DURATION_SECONDS) * 100}%` }}
                  />
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                  Responses received
                </p>
                <p className="mt-2 text-4xl font-bold text-primary">
                  {responseCount}/{activeParticipants.length}
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
                {/* Correct answer indicator for the host */}
                {embedded && (() => {
                  const correctText = getCorrectAnswerText(currentRound);
                  if (!correctText || correctText === "N/A") return null;
                  return (
                    <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                      <span className="text-sm font-semibold text-emerald-800">
                        {currentRound.correctOptionIds && currentRound.correctOptionIds.length > 1 ? "Correct answers: " : "Correct answer: "}
                        <span className="font-bold">{correctText}</span>
                      </span>
                    </div>
                  );
                })()}
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
                  {currentRound.correctOptionIds && currentRound.correctOptionIds.length > 1 ? "Correct answers" : "Correct answer"}
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
                  {currentRound.options.map((option: QuestionOption, index: number) => {
                    const distribution =
                      responseDistribution.find((item) => item.optionId === option.id)?.count ?? 0;
                    const maxCount = Math.max(...responseDistribution.map((item) => item.count), 1);
                    const heightPercent =
                      maxCount > 0 ? Math.max(18, Math.round((distribution / maxCount) * 100)) : 18;
                    const isCorrect = currentRound.correctOptionIds 
                      ? currentRound.correctOptionIds.includes(option.id) 
                      : option.id === currentRound.correctOptionId;
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
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 lg:h-full lg:min-h-0 lg:justify-center">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#F9C74F_0%,#FFD166_100%)] px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </div>
                <h1 className="mt-3 text-4xl font-black tracking-tight text-primary">
                  Round standings
                </h1>
                <p className="mt-2 text-sm font-medium text-inkd">
                  Scores are calculated from question points and live speed bonus.
                </p>
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

            <div className="rt-card-pop h-[34rem] overflow-hidden rounded-[32px] border border-[#1C5C45]/15 bg-[linear-gradient(135deg,#FFFEF8_0%,#F5F8F0_55%,#FFF6D8_100%)] p-5 text-primary shadow-[0_24px_65px_rgba(27,67,50,0.12)]">
              {displayLeaderboard.length === 0 ? (
                <div className="flex h-full items-center justify-center text-center">
                  <div>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[#FFF1C8] text-primary shadow-sm">
                      <Trophy className="h-7 w-7" />
                    </div>
                    <p className="mt-4 text-xl font-black">No scores yet</p>
                    <p className="mt-2 max-w-sm text-sm leading-6 text-inkd">
                      The ranking appears as soon as participants answer a round.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid h-full gap-5 lg:grid-cols-[22rem_minmax(0,1fr)]">
                  <div className="flex h-full flex-col justify-between rounded-[26px] bg-primary p-5 text-white shadow-[0_18px_45px_rgba(27,67,50,0.18)]">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                        Current leader
                      </p>
                      <div className="mt-5 flex items-center gap-4">
                        <div className="h-18 w-18 overflow-hidden rounded-[24px] ring-4 ring-white/15">
                          <Avatar
                            size={72}
                            name={`${displayLeaderboard[0].id}-${displayLeaderboard[0].name}`}
                            variant={getAvatarVariant(`${displayLeaderboard[0].id}-${displayLeaderboard[0].name}`)}
                            colors={getAvatarColors(`${displayLeaderboard[0].id}-${displayLeaderboard[0].name}`)}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-2xl font-black">
                            {displayLeaderboard[0].name}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-white/60">
                            Rank #{displayLeaderboard[0].rank}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/55">
                        Score
                      </p>
                      <p className="mt-2 text-6xl font-black tracking-tight">
                        {Number(displayLeaderboard[0].score || 0).toFixed(2).replace(/\.00$/, '')}
                      </p>
                      <div className="mt-5 grid grid-cols-3 gap-2">
                        {displayLeaderboard.slice(0, 3).map((entry, index: number) => (
                          <div
                            key={entry.id}
                            className="rounded-2xl border border-white/10 bg-white/8 p-3 text-center"
                          >
                            <p className="text-xs font-bold text-white/50">#{index + 1}</p>
                            <p className="mt-1 truncate text-sm font-bold">{entry.name}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex min-h-0 flex-col">
                    <div className="grid grid-cols-[4rem_minmax(0,1fr)_7rem] gap-3 px-3 text-xs font-bold uppercase tracking-[0.18em] text-primary/45">
                      <span>Rank</span>
                      <span>Participant</span>
                      <span className="text-right">Score</span>
                    </div>
                    <div ref={parent} className="mt-3 grid gap-3 overflow-hidden">
                      {displayLeaderboard.slice(0, 5).map((entry) => {
                        const entryScore = Number(entry.score || 0);
                        const rankDelta = (entry.previousRank || entry.rank) - entry.rank;
                        const isTop = entry.rank === 1;

                        return (
                          <div
                            key={entry.id}
                            className={`grid h-18 grid-cols-[4rem_minmax(0,1fr)_7rem] items-center gap-3 rounded-[22px] border px-4 shadow-sm ${
                              isTop
                                ? "border-[#FFD166]/70 bg-[#FFF6CC]"
                                : "border-[#1C5C45]/10 bg-white/85"
                            }`}
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-black text-primary shadow-sm">
                              {entry.rank}
                            </div>
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl">
                                <Avatar
                                  size={40}
                                  name={`${entry.id}-${entry.name}`}
                                  variant={getAvatarVariant(`${entry.id}-${entry.name}`)}
                                  colors={getAvatarColors(`${entry.id}-${entry.name}`)}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-base font-black text-primary">
                                  {entry.name}
                                </p>
                                <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary/45">
                                  {rankDelta > 0
                                    ? `Up ${rankDelta}`
                                    : rankDelta < 0
                                      ? `Down ${Math.abs(rankDelta)}`
                                      : "No move"}
                                </p>
                              </div>
                            </div>
                            <p className="text-right text-2xl font-black tabular-nums text-primary">
                              {Number(entryScore).toFixed(2).replace(/\.00$/, '')}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
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
                  {displayLeaderboard.slice(0, 3).map((entry, index: number) => {
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
                    href={embedded ? `/assessments/${assessment.id}/preview` : `/assessments/${assessment.id}`}
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
