"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Clock3,
  Flame,
  Radio,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import type { AssessmentCatalogItem } from "@/src/domains/assessment/types";
import { QuestionOptionButton, ScreenShell } from "./SessionShared";
import type { JoinPhase } from "./session.types";
import { buildQuestionRounds } from "./session.utils";

export function AssessmentJoinScreen({
  assessment,
  embedded,
}: {
  assessment: AssessmentCatalogItem;
  embedded?: boolean;
}) {
  const rounds = useMemo(
    () =>
      buildQuestionRounds([
        {
          id: `${assessment.id}-join-question-1`,
          question: "Sample live question visible to participants before the round opens.",
          type: "MULTIPLE_CHOICE",
          points: 100,
        },
        {
          id: `${assessment.id}-join-question-2`,
          question: "Second live question shown after the host advances to the next reveal.",
          type: "MULTIPLE_CHOICE",
          points: 120,
        },
      ]),
    [assessment.id],
  );
  const [displayName, setDisplayName] = useState("");
  const [phase, setPhase] = useState<JoinPhase>("lobby");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(12);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [streakCount, setStreakCount] = useState(0);

  const currentRound = rounds[questionIndex];
  const selectedOption =
    currentRound.options.find((option) => option.id === selectedAnswer) ?? null;
  const isCorrect = selectedAnswer === currentRound.correctOptionId;
  const speedBonus = selectedAnswer && timerSeconds >= 8 ? 50 : 0;
  const lastPoints = selectedAnswer ? (isCorrect ? currentRound.points + speedBonus : 0) : 0;
  const isLobbyPhase = phase === "lobby";

  useEffect(() => {
    if (phase !== "question_locked") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPhase("question_active");
      setTimerSeconds(12);
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [phase]);

  useEffect(() => {
    if (phase !== "question_active") {
      return;
    }

    if (timerSeconds <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (timerSeconds <= 1) {
        setPhase("result");
        return;
      }

      setTimerSeconds((seconds) => seconds - 1);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [phase, timerSeconds]);

  function joinLobby() {
    if (displayName.trim().length === 0) {
      return;
    }

    setPhase("question_locked");
  }

  function submitAnswer(optionId: string) {
    setSelectedAnswer(optionId);
    if (optionId === currentRound.correctOptionId) {
      setTotalScore((score) => score + currentRound.points + speedBonus);
      setStreakCount((count) => count + 1);
    } else {
      setStreakCount(0);
    }
    setPhase("result");
  }

  function goToNextRound() {
    if (questionIndex === rounds.length - 1) {
      setPhase("final");
      return;
    }

    setQuestionIndex((index) => index + 1);
    setSelectedAnswer(null);
    setPhase("question_locked");
  }

  return (
    <ScreenShell
      eyebrow={isLobbyPhase ? "Real-time Participant Flow" : ""}
      title={isLobbyPhase ? assessment.title : ""}
      description={isLobbyPhase ? assessment.description ?? "" : ""}
      variant={embedded ? "panel" : "page"}
      aside={null}
    >
      <div className="rt-stage-shell rounded-4xl border border-border bg-white p-5 shadow-sm sm:p-6">
        {phase === "lobby" ? (
          <div className="grid h-full gap-5 xl:grid-cols-[20rem_minmax(0,1fr)]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#4CC9F0_0%,#277DA1_100%)] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                <Users className="h-4 w-4" />
                Real-time lobby
              </div>
              <h2 className="mt-4 text-3xl font-bold text-primary">Join the live session</h2>
              <p className="mt-3 text-sm leading-6 text-inkd">
                Display name is always required in real-time mode before the participant enters the
                waiting lobby.
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

            <div className="rt-card-pop rounded-[30px] border border-border bg-white/85 p-5 shadow-sm">
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-primary">Display name</span>
                <input
                  type="text"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder="Enter your display name"
                  className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-primary outline-none transition focus:border-primary"
                />
              </label>
              <button
                type="button"
                disabled={displayName.trim().length === 0}
                onClick={joinLobby}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#F94144_0%,#FF6B6F_100%)] px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Join lobby
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}

        {phase === "question_locked" ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_16rem]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#F5F5F5] px-3 py-1 text-xs font-semibold text-primary">
                <Radio className="h-4 w-4" />
                Waiting for timer to open
              </div>
              <h2 className="mt-4 text-3xl font-bold leading-tight text-primary">{currentRound.question}</h2>
              <p className="mt-3 text-sm leading-6 text-inkd">
                Participants can see the question and options, but they cannot answer until the
                timer begins.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#FFF6CC] px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-4 w-4" />
                Get ready for a fast-answer bonus
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {currentRound.options.map((option, index) => (
                  <QuestionOptionButton
                    key={option.id}
                    option={option}
                    selected={false}
                    disabled
                    variant="realtime"
                    paletteIndex={index}
                    onClick={() => undefined}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-[linear-gradient(135deg,#16352A_0%,#24513D_100%)] p-5 text-white shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Lobby status
              </p>
              <p className="mt-2 text-2xl font-bold">Waiting for host to start...</p>
              <p className="mt-3 text-sm leading-6 text-white/75">
                Next reveal uses the same process each round: reveal, timer auto-start, answer,
                result, then wait for the host.
              </p>
            </div>
          </div>
        ) : null}

        {phase === "question_active" ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_16rem]">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                    Question {questionIndex + 1} of {rounds.length}
                  </p>
                  <h2 className="mt-2 text-3xl font-bold leading-tight text-primary">{currentRound.question}</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary shadow-sm ring-1 ring-border">
                  <Clock3 className="h-4 w-4" />
                  Timer active
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border bg-[linear-gradient(135deg,#F9C74F_0%,#FFD166_100%)] p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                      Speed bonus
                    </p>
                  </div>
                  <p className="mt-2 text-lg font-bold text-primary">+50 points if you answer fast</p>
                </div>
                <div className="rounded-2xl border border-border bg-[linear-gradient(135deg,#16352A_0%,#24513D_100%)] p-4 text-white shadow-sm">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4 text-[#FFD166]" />
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">
                      Streak meter
                    </p>
                  </div>
                  <p className="mt-2 text-lg font-bold">
                    {streakCount > 0 ? `${streakCount} in a row` : "Start your streak"}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {currentRound.options.map((option, index) => (
                  <QuestionOptionButton
                    key={option.id}
                    option={option}
                    selected={selectedAnswer === option.id}
                    variant="realtime"
                    paletteIndex={index}
                    onClick={() => submitAnswer(option.id)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div
                className={`rounded-[28px] border border-border bg-[linear-gradient(135deg,#16352A_0%,#24513D_100%)] p-5 text-white shadow-sm ${
                  timerSeconds <= 5 ? "rt-timer-critical" : ""
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Timer
                </p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <p className="text-4xl font-black">{timerSeconds}s</p>
                </div>
                <div className="rt-progress-shimmer mt-4 h-2.5 rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full transition ${
                      timerSeconds <= 5
                        ? "bg-[linear-gradient(90deg,#FF6B6F_0%,#F94144_100%)]"
                        : "bg-[linear-gradient(90deg,#4CC9F0_0%,#FFD166_55%,#43AA8B_100%)]"
                    }`}
                    style={{ width: `${(timerSeconds / 12) * 100}%` }}
                  />
                </div>
              </div>
              <div className="rounded-[28px] border border-border bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                  Score so far
                </p>
                <p className="mt-2 text-3xl font-bold text-primary">{totalScore}</p>
              </div>
            </div>
          </div>
        ) : null}

        {phase === "result" ? (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_16rem]">
            <div
              className={`rounded-[30px] border p-6 shadow-sm ${
                isCorrect
                  ? "border-[#43AA8B]/25 bg-[linear-gradient(135deg,#16352A_0%,#24513D_100%)] text-white"
                  : "border-[#F94144]/20 bg-[linear-gradient(135deg,#6F1D1B_0%,#B02A37_100%)] text-white"
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                Round result
              </p>
              <h2 className="mt-3 text-3xl font-bold">
                {isCorrect ? "Correct answer" : "Not this round"}
              </h2>
              <p className="mt-3 text-sm leading-6 text-white/75">
                {selectedOption?.text ?? "Timer ended before a choice was submitted."}
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">Points earned</p>
                  <p className="mt-2 text-2xl font-bold">{lastPoints}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">Total score</p>
                  <p className="mt-2 text-2xl font-bold">{totalScore}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">Speed bonus</p>
                  <p className="mt-2 text-2xl font-bold">{isCorrect ? speedBonus : 0}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">Streak</p>
                  <p className="mt-2 text-2xl font-bold">{streakCount}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-border bg-white p-5 shadow-sm">
                <p className="text-sm leading-6 text-inkd">
                  Participant waits here until the host advances to the next reveal.
                </p>
              </div>
              <div className="rounded-[28px] border border-border bg-[#FFF8E7] p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                  Motivation
                </p>
                <p className="mt-2 text-lg font-bold text-primary">
                  {isCorrect
                    ? "Keep the streak alive next round"
                    : "One fast correct answer can trigger a comeback"}
                </p>
              </div>
              <button
                type="button"
                onClick={goToNextRound}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#277DA1_0%,#4CC9F0_100%)] px-5 py-3 text-sm font-semibold text-white transition hover:scale-[1.01]"
              >
                {questionIndex === rounds.length - 1
                  ? "See final standing"
                  : "Wait for next question"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}

        {phase === "final" ? (
          <div className="rt-card-pop rounded-4xl border border-border bg-[linear-gradient(160deg,#16352A_0%,#214E3C_40%,#277DA1_100%)] p-8 text-white shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
              <Trophy className="h-4 w-4 text-[#95D5B2]" />
              Final standings
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Player</p>
                <p className="mt-3 text-2xl font-bold">{displayName}</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Total score</p>
                <p className="mt-3 text-2xl font-bold">{totalScore}</p>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Rank</p>
                <p className="mt-3 text-2xl font-bold">#4</p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Post-game hook</p>
                <h3 className="mt-3 text-2xl font-bold">Ready for a rematch?</h3>
                <p className="mt-3 text-sm leading-6 text-white/75">
                  Show players their score, rank, and streak badge, then tease the next bonus rule
                  so they want another run immediately.
                </p>
              </div>
              <div className="rounded-[28px] border border-[#95D5B2]/20 bg-[linear-gradient(180deg,rgba(149,213,178,0.18)_0%,rgba(255,255,255,0.04)_100%)] p-6">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">Your badges</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="font-semibold">
                      {streakCount > 1 ? `Streak chaser x${streakCount}` : "Momentum starter"}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="font-semibold">{totalScore >= 150 ? "Clutch finisher" : "Warm-up rounder"}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="font-semibold">Rematch opens soon</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </ScreenShell>
  );
}
