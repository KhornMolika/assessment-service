"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3, Radio, Trophy, Users } from "lucide-react";
import type { AssessmentCatalogItem } from "@/src/domains/assessment/types";
import { AssessmentOverviewCard, FlowStepper, QuestionOptionButton, ScreenShell } from "./SessionShared";
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

  const currentRound = rounds[questionIndex];
  const selectedOption =
    currentRound.options.find((option) => option.id === selectedAnswer) ?? null;
  const isCorrect = selectedAnswer === currentRound.correctOptionId;
  const lastPoints = selectedAnswer ? (isCorrect ? currentRound.points : 0) : 0;

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
      setTotalScore((score) => score + currentRound.points);
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
      eyebrow="Real-time Participant Flow"
      title={assessment.title}
      description="This participant UI follows the live sequence from the docs: lobby, locked reveal, active timer, per-question result, wait state, then final score and rank."
      variant={embedded ? "panel" : "page"}
      aside={
        <div className="space-y-4">
          <AssessmentOverviewCard assessment={assessment} />
          <div className="rounded-[28px] border border-border bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
              Live state
            </p>
            <p className="mt-2 text-2xl font-bold capitalize text-primary">
              {phase === "final" ? "Final" : phase.replace("_", " ")}
            </p>
            <p className="mt-3 text-sm leading-6 text-inkd">
              Participants rejoin from the lobby on refresh because live state comes from
              WebSocket events instead of persisted local storage.
            </p>
          </div>
        </div>
      }
    >
      <FlowStepper
        steps={["Lobby", "Question", "Result", "Final"]}
        activeStep={phase === "lobby" ? 0 : phase === "result" ? 2 : phase === "final" ? 3 : 1}
      />

      <div className="mt-6 rounded-4xl border border-border bg-white p-6 shadow-sm sm:p-8">
        {phase === "lobby" ? (
          <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#D8F3DC] px-3 py-1 text-xs font-semibold text-primary">
                <Users className="h-4 w-4" />
                Real-time lobby
              </div>
              <h2 className="mt-4 text-3xl font-bold text-primary">Join the live session</h2>
              <p className="mt-3 text-sm leading-6 text-inkd">
                Display name is always required in real-time mode before the participant enters the
                waiting lobby.
              </p>
            </div>

            <div className="rounded-[28px] border border-border bg-muted/20 p-5">
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
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Join lobby
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}

        {phase === "question_locked" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-primary">
                <Radio className="h-4 w-4" />
                Waiting for timer to open
              </div>
              <h2 className="mt-4 text-2xl font-bold text-primary">{currentRound.question}</h2>
              <p className="mt-3 text-sm leading-6 text-inkd">
                Participants can see the question and options, but they cannot answer until the
                timer begins.
              </p>
              <div className="mt-6 grid gap-3">
                {currentRound.options.map((option) => (
                  <QuestionOptionButton
                    key={option.id}
                    option={option}
                    selected={false}
                    disabled
                    onClick={() => undefined}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-[#16352A] p-5 text-white shadow-sm">
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
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                    Question {questionIndex + 1} of {rounds.length}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-primary">{currentRound.question}</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[#D8F3DC] px-3 py-1 text-xs font-semibold text-primary">
                  <Clock3 className="h-4 w-4" />
                  Timer active
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {currentRound.options.map((option) => (
                  <QuestionOptionButton
                    key={option.id}
                    option={option}
                    selected={selectedAnswer === option.id}
                    onClick={() => submitAnswer(option.id)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-border bg-[#16352A] p-5 text-white shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Timer
                </p>
                <p className="mt-2 text-4xl font-bold">{timerSeconds}s</p>
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
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="rounded-[28px] border border-border bg-[#16352A] p-6 text-white shadow-sm">
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
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-border bg-white p-5 shadow-sm">
                <p className="text-sm leading-6 text-inkd">
                  Participant waits here until the host advances to the next reveal.
                </p>
              </div>
              <button
                type="button"
                onClick={goToNextRound}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
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
          <div className="rounded-4xl border border-border bg-[#16352A] p-8 text-white shadow-sm">
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
          </div>
        ) : null}
      </div>
    </ScreenShell>
  );
}
