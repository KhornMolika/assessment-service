"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, Clock3, Copy, Crown, PlayCircle, QrCode, Radio, Trophy } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import type {
  AssessmentCatalogItem,
  AssessmentDetailQuestionItem,
} from "@/src/domains/assessment/types";
import { AssessmentOverviewCard, FlowStepper, QuestionOptionButton, ScreenShell } from "./SessionShared";
import type { HostPhase } from "./session.types";
import {
  buildDistribution,
  buildLeaderboard,
  buildParticipantRoster,
  buildQuestionRounds,
} from "./session.utils";

export function AssessmentHostScreen({
  assessment,
  questions,
}: {
  assessment: AssessmentCatalogItem;
  questions: AssessmentDetailQuestionItem[];
}) {
  const rounds = useMemo(() => buildQuestionRounds(questions), [questions]);
  const participants = useMemo(() => buildParticipantRoster(), []);
  const leaderboard = useMemo(() => buildLeaderboard(), []);
  const [copied, setCopied] = useState(false);
  const [phase, setPhase] = useState<HostPhase>("lobby");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(15);
  const [responseCount, setResponseCount] = useState(0);

  const currentRound = rounds[questionIndex];
  const participantUrl =
    typeof window === "undefined"
      ? `/assessments/${assessment.id}/join`
      : `${window.location.origin}/assessments/${assessment.id}/join`;
  const responseDistribution = useMemo(
    () => buildDistribution(currentRound.options, responseCount, currentRound.correctOptionId),
    [currentRound, responseCount],
  );

  useEffect(() => {
    if (phase !== "reveal") {
      return;
    }

    if (timerSeconds <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (timerSeconds <= 1) {
        setResponseCount(participants.length);
        setPhase("correct");
        return;
      }

      setTimerSeconds((seconds) => seconds - 1);
      setResponseCount((count) => Math.min(participants.length, count + 1));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [participants.length, phase, timerSeconds]);

  useEffect(() => {
    if (phase !== "correct") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPhase("leaderboard");
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [phase]);

  function startSession() {
    setQuestionIndex(0);
    setTimerSeconds(15);
    setResponseCount(0);
    setPhase("reveal");
  }

  function skipToCorrectAnswer() {
    setTimerSeconds(0);
    setResponseCount(participants.length);
    setPhase("correct");
  }

  function advanceToNextQuestion() {
    if (questionIndex === rounds.length - 1) {
      setPhase("winner");
      return;
    }

    setQuestionIndex((index) => index + 1);
    setTimerSeconds(15);
    setResponseCount(0);
    setPhase("reveal");
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(participantUrl);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <ScreenShell
      eyebrow="Real-time Host Flow"
      title={assessment.title}
      description="This host UI follows the documented live cycle: lobby, reveal with auto-start timer, correct answer, auto leaderboard, then host-driven next question."
      aside={
        <div className="space-y-4">
          <AssessmentOverviewCard assessment={assessment} />
          <div className="rounded-[28px] border border-border bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
              Phase
            </p>
            <p className="mt-2 text-2xl font-bold capitalize text-primary">
              {phase === "winner" ? "Winner podium" : phase}
            </p>
            <p className="mt-3 text-sm leading-6 text-inkd">
              Host emits `session:start`, `question:skip`, `question:next`, and `session:end`
              across this flow.
            </p>
          </div>
        </div>
      }
    >
      <FlowStepper
        steps={["Lobby", "Reveal", "Correct", "Leaderboard"]}
        activeStep={phase === "lobby" ? 0 : phase === "reveal" ? 1 : phase === "correct" ? 2 : 3}
      />

      <div className="mt-6 rounded-4xl border border-border bg-white p-6 shadow-sm sm:p-8">
        {phase === "lobby" ? (
          <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
            <div className="rounded-[28px] border border-border bg-[#16352A] p-6 text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
                <QrCode className="h-4 w-4 text-[#95D5B2]" />
                Lobby
              </div>
              <h2 className="mt-4 text-2xl font-bold">Launch from the control room</h2>
              <div className="mt-6 flex items-center justify-center rounded-[28px] bg-white p-4">
                <QRCodeSVG
                  value={participantUrl}
                  title={`Join ${assessment.title}`}
                  size={180}
                  bgColor="#FFFFFF"
                  fgColor="#16352A"
                />
              </div>
              <div className="mt-5 space-y-3">
                <div className="rounded-2xl bg-white/5 p-4 text-sm text-white/80">{participantUrl}</div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => void handleCopyLink()}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy link"}
                  </button>
                  <button
                    type="button"
                    onClick={startSession}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-primary transition hover:bg-white/90"
                  >
                    <PlayCircle className="h-4 w-4" />
                    Start
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-muted/20 p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                    Participants joined
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-primary">{participants.length} in lobby</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary ring-1 ring-border">
                  <Radio className="h-4 w-4" />
                  WAITING state
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {participants.map((participant) => (
                  <div key={participant.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                    <p className="text-sm font-semibold text-primary">{participant.name}</p>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                      {participant.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {phase === "reveal" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_19rem]">
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
                  Timer auto-started
                </div>
              </div>

              <div className="mt-6 grid gap-3">
                {currentRound.options.map((option) => (
                  <QuestionOptionButton
                    key={option.id}
                    option={option}
                    selected={false}
                    onClick={() => undefined}
                    disabled
                  />
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                <button
                  type="button"
                  onClick={skipToCorrectAnswer}
                  className="rounded-2xl border border-border px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
                >
                  Skip to correct answer
                </button>
                <div className="rounded-2xl bg-muted px-5 py-3 text-sm font-semibold text-primary">
                  Host sees live responses coming in
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-[28px] border border-border bg-[#16352A] p-5 text-white shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/60">
                  Timer
                </p>
                <p className="mt-2 text-4xl font-bold">{timerSeconds}s</p>
                <div className="mt-4 h-3 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-[#95D5B2] transition"
                    style={{ width: `${(timerSeconds / 15) * 100}%` }}
                  />
                </div>
              </div>

              <div className="rounded-[28px] border border-border bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                  Responses received
                </p>
                <p className="mt-2 text-3xl font-bold text-primary">
                  {responseCount}/{participants.length}
                </p>
                <p className="mt-3 text-sm leading-6 text-inkd">
                  Mirrors `answer:received` updates while the timer runs.
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {phase === "correct" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-[#D8F3DC] px-3 py-1 text-xs font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4" />
                Correct answer
              </div>
              <h2 className="mt-4 text-2xl font-bold text-primary">
                {currentRound.options.find((option) => option.id === currentRound.correctOptionId)?.text}
              </h2>
              <p className="mt-3 text-sm leading-6 text-inkd">
                This state is timed, then automatically advances to the leaderboard.
              </p>

              <div className="mt-6 space-y-3">
                {currentRound.options.map((option) => {
                  const distribution =
                    responseDistribution.find((item) => item.optionId === option.id)?.count ?? 0;
                  const percentage =
                    responseCount > 0 ? Math.round((distribution / responseCount) * 100) : 0;
                  const isCorrect = option.id === currentRound.correctOptionId;

                  return (
                    <div key={option.id} className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-sm font-semibold ${isCorrect ? "text-primary" : "text-inkd"}`}>
                          {option.text}
                        </p>
                        <span className="text-sm font-semibold text-primary">{percentage}%</span>
                      </div>
                      <div className="mt-3 h-3 rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${isCorrect ? "bg-primary" : "bg-[#95D5B2]"}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] border border-border bg-muted/20 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/55">
                Auto advance
              </p>
              <p className="mt-2 text-lg font-semibold text-primary">Leaderboard in ~4 seconds</p>
            </div>
          </div>
        ) : null}

        {phase === "leaderboard" ? (
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="rounded-[28px] border border-border bg-[#16352A] p-6 text-white shadow-sm">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
                <Trophy className="h-4 w-4 text-[#95D5B2]" />
                Leaderboard
              </div>
              <div className="mt-6 grid gap-3">
                {leaderboard.map((entry, index) => (
                  <div key={entry.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{entry.name}</p>
                          <p className="text-xs uppercase tracking-[0.18em] text-white/55">
                            Current rank
                          </p>
                        </div>
                      </div>
                      <p className="text-xl font-bold">{entry.score}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={advanceToNextQuestion}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {questionIndex === rounds.length - 1 ? "Show winner podium" : "Next question"}
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="rounded-[28px] border border-border bg-white p-5 text-sm leading-6 text-inkd shadow-sm">
                Host clicks Next Question to repeat the same reveal process for the next round.
              </p>
            </div>
          </div>
        ) : null}

        {phase === "winner" ? (
          <div className="rounded-4xl border border-border bg-[#16352A] p-8 text-white shadow-sm">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
              <Crown className="h-4 w-4 text-[#95D5B2]" />
              Winner podium
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`rounded-[28px] border border-white/10 bg-white/5 p-6 ${
                    index === 0 ? "md:-translate-y-4" : ""
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">
                    Place {index + 1}
                  </p>
                  <p className="mt-3 text-2xl font-bold">{entry.name}</p>
                  <p className="mt-2 text-lg font-semibold text-[#95D5B2]">{entry.score} pts</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </ScreenShell>
  );
}
