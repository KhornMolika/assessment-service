"use client";

import { useEffect, useMemo, useState } from "react";
import type { AssessmentCatalogItem } from "@/src/domains/assessment/types";
import { QuestionRenderer } from "../renderers/QuestionRenderer";
import type { QuestionRendererValue } from "../renderers/types";
import { ScreenShell } from "./SessionShared";
import { JoinFinal } from "./join/JoinFinal";
import { JoinLobby } from "./join/JoinLobby";
import { JoinResult } from "./join/JoinResult";
import { JoinWaitingState } from "./join/JoinWaitingState";
import { realtimeEvents } from "./realtime.events";
import type { JoinPhase } from "./session.types";
import {
  buildQuestionRounds,
  hasAnswerResponse,
  isCorrectAnswerResponse,
} from "./session.utils";

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
  const [answerValue, setAnswerValue] = useState<QuestionRendererValue>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [streakCount, setStreakCount] = useState(0);

  const currentRound = rounds[questionIndex];
  const isCorrect = isCorrectAnswerResponse(currentRound, answerValue);
  const speedBonus = hasAnswerResponse(answerValue) && timerSeconds >= 8 ? 50 : 0;
  const lastPoints = hasAnswerResponse(answerValue) ? (isCorrect ? currentRound.points + speedBonus : 0) : 0;
  const isLobbyPhase = phase === "lobby";

  useEffect(() => {
    if (phase !== "waiting") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPhase("pick_option");
      setTimerSeconds(12);
    }, 1500);

    return () => window.clearTimeout(timeoutId);
  }, [phase]);

  useEffect(() => {
    if (phase !== "pick_option") {
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

    setPhase("waiting");
  }

  function submitAnswer(value: QuestionRendererValue) {
    setAnswerValue(value);
    const roundSpeedBonus = hasAnswerResponse(value) && timerSeconds >= 8 ? 50 : 0;

    if (isCorrectAnswerResponse(currentRound, value)) {
      setTotalScore((score) => score + currentRound.points + roundSpeedBonus);
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
    setAnswerValue(null);
    setTimerSeconds(12);
    setPhase("pick_option");
  }

  return (
    <ScreenShell
      eyebrow={isLobbyPhase ? "Real-time Participant Flow" : ""}
      title={isLobbyPhase ? assessment.title : ""}
      description={isLobbyPhase ? assessment.description ?? "" : ""}
      variant={embedded ? "panel" : "page"}
      aside={null}
    >
      <div className="flex min-h-[32rem] flex-col sm:min-h-[34rem] lg:h-full lg:min-h-0">
        {phase === "lobby" ? (
          <div className="flex flex-1 items-start py-2 lg:items-center">
            <JoinLobby
              displayName={displayName}
              onDisplayNameChange={setDisplayName}
              onJoin={joinLobby}
              eventName={realtimeEvents.joinRoom}
            />
          </div>
        ) : null}

        {phase === "waiting" ? (
          <JoinWaitingState
            title="Waiting for host to start..."
            description="The first question opens when the host starts the round."
          />
        ) : null}

        {phase === "pick_option" ? (
          <div className="mx-auto flex w-full max-w-4xl flex-1 items-start py-2 sm:py-4 lg:items-center">
            <div className="w-full" data-flow-event={realtimeEvents.submitAnswer}>
              <QuestionRenderer
                question={currentRound}
                value={answerValue}
                onChange={submitAnswer}
              />
            </div>
          </div>
        ) : null}

        {phase === "result" ? (
          <JoinResult
            currentRound={currentRound}
            answerValue={answerValue}
            isCorrect={isCorrect}
            lastPoints={lastPoints}
            totalScore={totalScore}
            speedBonus={speedBonus}
            isLastQuestion={questionIndex === rounds.length - 1}
            onAdvance={goToNextRound}
          />
        ) : null}

        {phase === "final" ? (
          <JoinFinal
            displayName={displayName}
            totalScore={totalScore}
            rank="#4"
            streakCount={streakCount}
          />
        ) : null}
      </div>
    </ScreenShell>
  );
}
