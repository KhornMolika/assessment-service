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
  buildQuestionRounds,
  getCorrectAnswerText,
  isSubjectiveQuestion,
  normalizeQuestionRendererType,
} from '@/src/lib/session/session.utils';
import { Button } from "@/src/components/ui/ui/button";
import { useRealtimeSession, type RealtimeSessionReturn } from "@/src/hooks/use-realtime-session";
import { RoomRole } from "@/src/types/runtime.types";
import { startRealtimeSessionHost } from "@/src/lib/actions/runtime.actions";
import { toast } from "sonner";
import { useAutoAnimate } from "@formkit/auto-animate/react";

const QUESTION_DURATION_SECONDS = 30;
const LEADERBOARD_DURATION_SECONDS = 10;

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
  const rounds = useMemo(() => {
    const objectiveQuestions = questions.filter((q) => !isSubjectiveQuestion(q.type));
    return buildQuestionRounds(objectiveQuestions);
  }, [questions]);
  const [copied, setCopied] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [leaderboardSeconds, setLeaderboardSeconds] = useState(LEADERBOARD_DURATION_SECONDS);
  const [winnerView, setWinnerView] = useState<"podium" | "rankings">("podium");
  const [origin, setOrigin] = useState("");
  const previousTimerRef = useRef(timerSeconds);
  const autoRevealQuestionRef = useRef<string | null>(null);
  const { soundEnabled, setSoundEnabled, prime, playTone } = useRealtimeAudio();
  const [parent] = useAutoAnimate();

  const { isConnected, roomState, joinRoom, emitStartQuestion, emitRevealAnswers, showStoredLeaderboard } = activeSession;

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
      const res = await startRealtimeSessionHost(assessment.id, { reset: true });
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
  const responseDistribution = useMemo(() => {
    const stats = roomState.questionResults?.stats;
    return Array.isArray(stats)
      ? stats.map((item) => ({
          optionId: String(item.optionId),
          count: Number(item.count ?? 0),
        }))
      : [];
  }, [roomState.questionResults?.stats]);
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
    if (phase !== "leaderboard") return;
    // Auto-advance removed. Host must manually click "Next".
  }, [phase]);

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
    setWinnerView("podium");
    emitStartQuestion(rounds[0].id);
  }


  
  function skipToCorrectAnswer() {
    emitRevealAnswers(assessment.id);
  }

  function showLeaderboard() {
    setLeaderboardSeconds(LEADERBOARD_DURATION_SECONDS);
    showStoredLeaderboard();
  }


  function advanceToNextQuestion() {
    if (questionIndex === rounds.length - 1) {
      setWinnerView("podium");
      emitStartQuestion();
      return;
    }
    const nextIndex = questionIndex + 1;
    setQuestionIndex(nextIndex);
    setLeaderboardSeconds(LEADERBOARD_DURATION_SECONDS);
    emitStartQuestion(rounds[nextIndex].id);
  }


  async function handleCopyLink() {
    await navigator.clipboard.writeText(participantUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  const currentRendererType = normalizeQuestionRendererType(currentRound.type);
  const isChoiceResult =
    currentRendererType === "single" ||
    currentRendererType === "multiple";
  const correctAnswerText = getCorrectAnswerText(currentRound);
  const answerLookup = (id: string) =>
    currentRound.options.find((option: QuestionOption) => option.id === id)?.text ?? id;
  const correctOptionIds =
    currentRound.correctOptionIds && currentRound.correctOptionIds.length > 0
      ? currentRound.correctOptionIds
      : currentRound.correctOptionId
        ? [currentRound.correctOptionId]
        : [];

  function renderCorrectAnswerPanel() {
    if (isChoiceResult) {
      return (
        <div className={`grid gap-3 md:grid-cols-2 ${
          currentRound.options?.length === 2 ? "xl:grid-cols-2" :
          currentRound.options?.length === 3 ? "xl:grid-cols-3" :
          "xl:grid-cols-4"
        }`}>
          {currentRound.options.map((option: QuestionOption, index: number) => {
            const distribution =
              responseDistribution.find((item) =>
                [option.id, option.label, option.text].some(
                  (value) => String(value).toLowerCase() === item.optionId.toLowerCase(),
                ),
              )?.count ?? 0;
            const maxCount = Math.max(...responseDistribution.map((item) => item.count), 1);
            const heightPercent =
              maxCount > 0 ? Math.max(8, Math.round((distribution / maxCount) * 100)) : 8;
            const percent =
              responseCount > 0 ? Math.round((distribution / responseCount) * 100) : 0;
            const isCorrect = correctOptionIds.includes(option.id);
            const paletteClassName = [
              "from-[#F94144] to-[#FF6B6F]",
              "from-[#277DA1] to-[#4CC9F0]",
              "from-[#F9C74F] to-[#FFD166]",
              "from-[#43AA8B] to-[#7FE0C0]",
            ][index % 4];

            return (
              <div
                key={option.id}
                className={`rounded-[24px] border bg-white p-4 shadow-sm transition ${
                  isCorrect ? "border-[#95D5B2] ring-4 ring-[#D8F3DC]" : "border-[#1C5C45]/10"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-linear-to-br ${paletteClassName} text-base font-black ${index === 2 ? "text-primary" : "text-white"}`}>
                    {option.label}
                  </div>
                  {isCorrect ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#D8F3DC] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Correct
                    </span>
                  ) : null}
                </div>

                <p className="mt-4 line-clamp-2 min-h-12 text-lg font-black text-primary">
                  {option.text}
                </p>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-4xl font-black tabular-nums text-primary">{distribution}</p>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary/45">
                      votes
                    </p>
                  </div>
                  <p className="text-sm font-black text-primary/60">{percent}%</p>
                </div>

                <div className="mt-4 h-3 overflow-hidden rounded-full bg-primary/8">
                  <div
                    className={`h-full rounded-full bg-linear-to-r ${paletteClassName} transition-all duration-500`}
                    style={{
                      width: `${heightPercent}%`,
                      animationDelay: `${index * 90}ms`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (currentRendererType === "ordering") {
      const sequence = Array.isArray(currentRound.correctAnswers?.sequence)
        ? currentRound.correctAnswers.sequence
        : correctOptionIds;
      return (
        <div className="rounded-[24px] border border-[#95D5B2] bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary/45">
            Correct order
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {sequence.map((id: string, index: number) => (
              <div key={`${id}-${index}`} className="flex min-h-14 items-center gap-3 rounded-2xl bg-[#D8F3DC] px-4 py-3 text-primary">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-black text-white">
                  {index + 1}
                </span>
                <span className="font-black">{answerLookup(id)}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (currentRendererType === "matching") {
      const pairs = Array.isArray(currentRound.correctAnswers?.pairs)
        ? currentRound.correctAnswers.pairs
        : [];
      const raw = currentRound.rawOptions;
      const leftOptions = raw?.leftSide || raw?.left || [];
      const rightOptions = raw?.rightSide || raw?.right || [];
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {pairs.map((pair: { leftId?: string; left?: string; rightId?: string; right?: string }, index: number) => {
            const leftId = pair.leftId || pair.left || "";
            const rightId = pair.rightId || pair.right || "";
            const leftText =
              leftOptions.find((option: { id: string; text?: string }) => option.id === leftId)?.text ?? leftId;
            const rightText =
              rightOptions.find((option: { id: string; text?: string }) => option.id === rightId)?.text ?? rightId;

            return (
              <div key={`${leftId}-${rightId}-${index}`} className="rounded-[24px] border border-[#95D5B2] bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary/45">
                  Pair {index + 1}
                </p>
                <div className="mt-3 grid items-center gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
                  <div className="rounded-2xl bg-[#F4FBF6] px-4 py-3 font-black text-primary">
                    {leftText}
                  </div>
                  <ArrowRight className="mx-auto h-5 w-5 text-primary/40" />
                  <div className="rounded-2xl bg-[#D8F3DC] px-4 py-3 font-black text-primary">
                    {rightText}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (currentRendererType === "fill") {
      const acceptedAnswers = Array.isArray(currentRound.correctAnswers?.answers)
        ? currentRound.correctAnswers.answers
        : [];
      return (
        <div className="grid gap-3 md:grid-cols-2">
          {acceptedAnswers.map((accepted: string | string[], index: number) => {
            const answers = Array.isArray(accepted) ? accepted : [String(accepted)];
            return (
              <div key={index} className="rounded-[24px] border border-[#95D5B2] bg-white p-4 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary/45">
                  Blank {index + 1}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {answers.map((answer) => (
                    <span key={answer} className="rounded-full bg-[#D8F3DC] px-3 py-1.5 text-sm font-black text-primary">
                      {answer}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    if (currentRendererType === "rating") {
      return (
        <div className="rounded-[24px] border border-[#1C5C45]/10 bg-white p-5 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-primary/45">
            Rating question
          </p>
          <p className="mt-3 text-xl font-black text-primary">
            Rating questions do not have a fixed correct answer.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-[24px] border border-[#95D5B2] bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-primary/45">
          Reference answer
        </p>
        <p className="mt-3 whitespace-pre-wrap text-xl font-black leading-8 text-primary">
          {correctAnswerText}
        </p>
      </div>
    );
  }

  if (phase === "winner") {
    return (
      <div className={`${embedded ? "absolute inset-0 rounded-[2.5rem]" : "fixed inset-0"} z-50 overflow-hidden bg-[radial-gradient(circle_at_top,#D8F3DC_0%,transparent_34%),linear-gradient(180deg,#123426_0%,#1B4F3B_54%,#0F2B21_100%)] p-5 text-white shadow-[0_26px_70px_rgba(17,48,35,0.24)] lg:flex lg:flex-col lg:p-7`}>
        <div className="pointer-events-none absolute inset-0 opacity-80">
          {Array.from({ length: 18 }).map((_, index) => (
            <span
              key={index}
              className="absolute h-2 w-2 animate-bounce rounded-full"
              style={{
                left: `${8 + ((index * 17) % 84)}%`,
                top: `${6 + ((index * 29) % 30)}%`,
                animationDelay: `${index * 80}ms`,
                backgroundColor: ["#FFD166", "#95D5B2", "#52B788", "#F4F1DE"][index % 4],
              }}
            />
          ))}
        </div>

        <div className="relative z-10 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
              <Crown className="h-4 w-4 text-[#FFD166]" />
              Winner podium
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-tight">Champion results</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
              {winnerView === "podium"
                ? "Top performers take the stage first."
                : "Every participant ranked from first to last."}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              onClick={() => setWinnerView((view) => (view === "podium" ? "rankings" : "podium"))}
              className="rounded-2xl bg-[#FFD166] px-5 py-3 text-sm font-black text-primary shadow-[0_18px_36px_rgba(0,0,0,0.18)] transition hover:bg-[#FFE08A]"
            >
              {winnerView === "podium" ? "Next: all ranks" : "Back to podium"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Link
              href={embedded ? `/assessments/${assessment.id}/preview` : `/assessments/${assessment.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/16"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        </div>

        <div className="relative z-10 mt-6 min-h-0 flex-1">
          {winnerView === "podium" ? (
            <div className="flex h-full min-h-0 flex-col justify-end rounded-[32px] border border-white/10 bg-white/8 p-5 backdrop-blur-sm">
              <div className="flex items-end justify-center gap-4">
                {displayLeaderboard.slice(0, 3).map((entry, index: number) => {
                  const place = index + 1;
                  const orderClassName =
                    place === 1 ? "order-2" : place === 2 ? "order-1" : "order-3";
                  const stepHeight =
                    place === 1 ? "h-64" : place === 2 ? "h-52" : "h-44";
                  const stepTone =
                    place === 1
                      ? "from-[#FFD166] to-[#F9C74F] text-primary"
                      : place === 2
                        ? "from-[#D8F3DC] to-[#95D5B2] text-primary"
                        : "from-[#74C69D] to-[#40916C] text-white";

                  return (
                    <div
                      key={entry.id}
                      className={`animate-in slide-in-from-bottom-6 fade-in duration-500 w-full max-w-[16rem] ${orderClassName}`}
                      style={{ animationDelay: `${index * 120}ms` }}
                    >
                      <div className="-rotate-3 rounded-xl bg-white px-4 py-2 text-center text-lg font-black text-primary shadow-[0_18px_34px_rgba(0,0,0,0.18)]">
                        {entry.name}
                      </div>
                      <div className="mx-auto mt-4 h-16 w-16 overflow-hidden rounded-3xl ring-4 ring-white/20 shadow-[0_20px_40px_rgba(0,0,0,0.18)]">
                        <Avatar
                          size={64}
                          name={entry.name}
                          variant={getAvatarVariant(entry.name)}
                          colors={getAvatarColors(entry.name)}
                        />
                      </div>
                      <div
                        className={`mt-4 flex w-full flex-col items-center justify-center rounded-t-[34px] bg-linear-to-t ${stepTone} ${stepHeight} shadow-[0_24px_50px_rgba(0,0,0,0.20)]`}
                      >
                        {place === 1 ? <Crown className="mb-3 h-9 w-9 text-primary" /> : null}
                        <p className="text-5xl font-black">{place}</p>
                        <p className="mt-3 text-sm font-black tabular-nums">
                          {Number(entry.score || 0).toFixed(2).replace(/\.00$/, '')} pts
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {displayLeaderboard.length > 3 ? (
                <div className="mx-auto mt-4 w-full max-w-lg rounded-t-[26px] bg-white/10 p-3">
                  <p className="text-center text-xs font-black uppercase tracking-[0.18em] text-white/65">
                    Runners-up
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {displayLeaderboard.slice(3, 5).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between rounded-2xl bg-white/10 px-3 py-2 text-sm font-bold">
                        <span>#{entry.rank} {entry.name}</span>
                        <span>{Number(entry.score || 0).toFixed(2).replace(/\.00$/, '')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="h-full min-h-0 rounded-[32px] border border-white/10 bg-white/95 p-5 text-primary shadow-[0_24px_60px_rgba(0,0,0,0.16)]">
              <div className="grid grid-cols-[4rem_minmax(0,1fr)_7rem] gap-3 px-3 text-xs font-black uppercase tracking-[0.18em] text-primary/50">
                <span>Rank</span>
                <span>Participant</span>
                <span className="text-right">Score</span>
              </div>
              <div className="mt-3 grid max-h-[calc(100%-2rem)] gap-2 overflow-y-auto pr-1">
                {displayLeaderboard.map((entry) => (
                  <div
                    key={entry.id}
                    className="grid grid-cols-[4rem_minmax(0,1fr)_7rem] items-center gap-3 rounded-2xl border border-primary/10 bg-[linear-gradient(135deg,#FFFFFF_0%,#F4FBF6_100%)] dark:bg-card dark:bg-none px-4 py-3 shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-black text-white">
                      {entry.rank}
                    </div>
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-2xl">
                        <Avatar
                          size={40}
                          name={entry.name}
                          variant={getAvatarVariant(entry.name)}
                          colors={getAvatarColors(entry.name)}
                        />
                      </div>
                      <p className="truncate text-base font-black">{entry.name}</p>
                    </div>
                    <p className="text-right text-xl font-black tabular-nums">
                      {Number(entry.score || 0).toFixed(2).replace(/\.00$/, '')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {phase === "leaderboard" && (
        <div className="fixed inset-x-0 top-0 z-[100] h-1.5 bg-primary/10">
          <div
            className="h-full bg-[linear-gradient(90deg,#52B788_0%,#FFD166_100%)] shadow-[0_0_10px_rgba(82,183,136,0.8)] transition-all duration-1000 ease-linear"
            style={{
              width: `${((LEADERBOARD_DURATION_SECONDS - leaderboardSeconds) / LEADERBOARD_DURATION_SECONDS) * 100}%`,
            }}
          />
        </div>
      )}
      <ScreenShell
      eyebrow={isLobbyPhase ? "Real-time Host Flow" : ""}
      title={isLobbyPhase ? assessment.name || "Untitled" : ""}
      description={isLobbyPhase ? assessment.description ?? "" : ""}
      variant={embedded ? "panel" : "page"}
      viewportLocked={!embedded}
      aside={null}
      headerAction={
        phase === "reveal" ? (
          <div className="flex flex-col items-end gap-1.5 sm:gap-2">
            <div
              className={`shrink-0 rounded-xl sm:rounded-3xl border border-border bg-white px-2.5 py-1.5 sm:px-4 sm:py-2 text-right shadow-sm ${
                timerSeconds <= 5 ? "rt-timer-critical text-[#F94144]" : "text-primary"
              }`}
            >
              <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                <Clock3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em]">
                  {timerSeconds <= 5 ? "Final countdown" : "Live answering"}
                </span>
                <span className="ml-2 text-lg sm:text-2xl font-black">{timerSeconds}s</span>
              </div>
            </div>
            <div className="rt-progress-shimmer w-full max-w-[200px] h-1.5 sm:h-2 rounded-full bg-primary/10">
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
        ) : null
      }
    >
      <div className="h-full min-h-0">
        {phase === "lobby" ? (
          <div
            className={`grid h-full min-h-0 gap-4 ${
              embedded
                ? "xl:grid-cols-[24rem_minmax(0,1fr)] 2xl:grid-cols-[26rem_minmax(0,1fr)]"
                : "xl:grid-cols-[30rem_minmax(0,1fr)]"
            }`}
          >
            {/* Left Column: QR Code & Start Controls */}
            <div className="relative flex min-h-0 flex-col justify-between overflow-hidden rounded-[26px] border border-[#1C5C45]/15 bg-[linear-gradient(180deg,#FFFEF8_0%,#F3F8F1_100%)] dark:bg-card dark:bg-none p-5 text-primary shadow-[0_22px_55px_rgba(27,67,50,0.10)] 2xl:p-6">
              
              <div className="relative z-10">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#1C5C45]/15 bg-primary/8 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-primary 2xl:mb-6">
                  <QrCode className="h-4 w-4 text-[#95D5B2]" />
                  Join Lobby
                </div>
                
                <h2 className="text-2xl font-extrabold leading-tight tracking-tight 2xl:text-3xl">
                  Invite your participants to join
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-inkd 2xl:text-[15px]">
                  Ask participants to scan this QR code or go to the link below to enter the live session.
                </p>

                <div className="mt-5 flex items-center justify-center 2xl:mt-8">
                  <div className="animate-float relative rounded-[26px] border border-[#1C5C45]/15 bg-white p-3 shadow-[0_18px_45px_rgba(27,67,50,0.12)]">
                    <div className="rounded-[20px] bg-white p-3">
                      <QRCodeSVG
                        value={participantUrl}
                        title={`Join ${assessment.name}`}
                        size={embedded ? 132 : 180}
                        bgColor="#FFFFFF"
                        fgColor="#113023"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-5 space-y-3 2xl:mt-8">
                <div className="flex items-center justify-between rounded-2xl border border-[#1C5C45]/15 bg-white p-2.5 shadow-sm">
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
                  className="group relative w-full overflow-hidden rounded-2xl bg-primary px-4 py-4 text-base font-bold text-white shadow-[0_18px_36px_rgba(17,48,35,0.22)] transition-all hover:scale-[1.02] hover:bg-[#174735] hover:shadow-[0_22px_45px_rgba(17,48,35,0.28)] disabled:cursor-not-allowed disabled:border disabled:border-[#1C5C45]/10 disabled:bg-[linear-gradient(180deg,#F4F1EA_0%,#EAE6DC_100%)] dark:bg-card dark:bg-none disabled:text-primary/45 disabled:shadow-inner disabled:hover:scale-100 2xl:py-5"
                >
                  <div className="absolute inset-0 bg-white/12 opacity-0 transition-opacity group-hover:opacity-100 group-disabled:hidden" />
                  <PlayCircle className="mr-2 h-6 w-6" />
                  {hasParticipants ? "Start Session Now" : "Waiting for participants"}
                </Button>
              </div>
            </div>

            {/* Right Column: Participant Roster */}
            <div className="flex h-full min-h-0 flex-col rounded-[26px] border border-border bg-white/80 shadow-[0_18px_45px_rgba(27,67,50,0.08)] backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-border/50 px-5 py-4 2xl:px-6">
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
              <div className="min-h-0 flex-1 overflow-hidden p-5 2xl:p-6">
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
                  <div className="grid grid-cols-1 gap-2.5 2xl:grid-cols-2">
                    {activeParticipants.map((p, index) => {
                      const colors = getAvatarColors(p.name);
                      return (
                        <div
                          key={p.id}
                          className="group flex min-w-0 items-center gap-3 rounded-2xl border border-[#1C5C45]/10 bg-[linear-gradient(135deg,#FFFFFF_0%,#F4FBF6_100%)] dark:bg-card dark:bg-none px-3.5 py-3 shadow-sm transition-all animate-in fade-in slide-in-from-bottom-1 duration-300 hover:border-primary/25 hover:shadow-md"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/8 text-xs font-bold text-primary">
                            {index + 1}
                          </div>
                          <div className="shrink-0 rounded-full border border-white bg-white p-0.5 shadow-sm">
                            <Avatar
                              size={38}
                              name={p.name}
                              variant={getAvatarVariant(p.name)}
                              colors={colors}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-ink">
                              {p.name || "Anonymous"}
                            </span>
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                              Connected
                            </span>
                          </div>
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
            <div className="grid gap-4 lg:grid-cols-1">
              <div className="rounded-3xl border border-border bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                  Responses received
                </p>
                <p className="mt-2 text-4xl font-bold text-primary">
                  {responseCount} <span className="text-xl font-medium text-inkd">/ {activeParticipants.length}</span>
                </p>
                <p className="mt-2 text-sm leading-6 text-inkd">Live response wave is building while the room races the clock.</p>
              </div>
            </div>

            <div className="rt-card-pop flex-1 rounded-[30px] border border-[#FFD166]/55 bg-[linear-gradient(135deg,#FFF6CC_0%,#FFE7B8_42%,#FFF9E1_100%)] dark:bg-card dark:bg-none p-5 shadow-sm lg:flex lg:min-h-0 lg:flex-col lg:p-6">
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
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 lg:h-full lg:min-h-0 lg:justify-center">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#43AA8B_0%,#7FE0C0_100%)] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  {currentRound.correctOptionIds && currentRound.correctOptionIds.length > 1 ? "Correct answers" : "Correct answer"}
                </div>
                <h2 className="mt-3 max-w-4xl text-3xl font-black leading-tight text-primary">
                  {currentRound.question}
                </h2>
                <p className="mt-2 text-sm font-semibold text-inkd">
                  {responseCount} {responseCount === 1 ? "participant" : "participants"} answered this round.
                </p>
              </div>
              <Button
                type="button"
                data-flow-event={realtimeEvents.showRank}
                onClick={showLeaderboard}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(17,48,35,0.18)] transition hover:bg-[#174735]"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="min-h-0 rounded-[32px] border border-[#1C5C45]/15 bg-white p-5 shadow-[0_24px_65px_rgba(27,67,50,0.10)]">
              <div className="rounded-[26px] bg-[linear-gradient(135deg,#F8FBF7_0%,#EEF7F1_100%)] dark:bg-card dark:bg-none p-4 sm:p-5">
                {renderCorrectAnswerPanel()}
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
                onClick={advanceToNextQuestion}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(17,48,35,0.18)] transition hover:bg-[#174735]"
              >
                {questionIndex === rounds.length - 1 ? "Finish Assessment" : "Next Question"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="rt-card-pop h-[34rem] overflow-hidden rounded-[32px] border border-[#1C5C45]/15 bg-[linear-gradient(135deg,#FFFEF8_0%,#F5F8F0_55%,#FFF6D8_100%)] dark:bg-card dark:bg-none p-5 text-primary shadow-[0_24px_65px_rgba(27,67,50,0.12)]">
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
                            name={displayLeaderboard[0].name}
                            variant={getAvatarVariant(displayLeaderboard[0].name)}
                            colors={getAvatarColors(displayLeaderboard[0].name)}
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
                                  name={entry.name}
                                  variant={getAvatarVariant(entry.name)}
                                  colors={getAvatarColors(entry.name)}
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
      </div>
    </ScreenShell>
    </>
  );
}
