"use client";

import { useEffect, useMemo, useState } from "react";
import type { AssessmentCatalogItem } from "@/src/types";
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
  requiresParticipantDisplayName,
} from "./session.utils";
import { useRealtimeSession } from "@/src/hooks/use-realtime-session";
import { RoomRole } from "@/src/types/runtime.types";
import { apiClient } from "@/src/lib/api-client";
import { toast } from "sonner";

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
  const requiresEntry = assessment.participant_identity !== "ANONYMOUS";
  const requiresDisplayName = requiresParticipantDisplayName(assessment.participant_identity);
  
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(12);
  const [answerValue, setAnswerValue] = useState<QuestionRendererValue>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [participantId, setParticipantId] = useState<string | null>(null);

  const { isConnected, roomState, joinRoom, emitSubmitAnswer } = useRealtimeSession();

  const currentRound = roomState.currentQuestion || rounds[0];
  const isCorrect = isCorrectAnswerResponse(currentRound, answerValue);
  const speedBonus = hasAnswerResponse(answerValue) && timerSeconds >= 8 ? 50 : 0;
  const lastPoints = hasAnswerResponse(answerValue) ? (isCorrect ? currentRound.points + speedBonus : 0) : 0;
  const phase = roomState.phase;
  const isLobbyPhase = phase === "lobby";

  // Reset local state when a new question starts
  useEffect(() => {
    if (phase === "active") {
      setTimerSeconds(12);
      setAnswerValue(null);
    }
  }, [phase, currentRound?.id]);

  useEffect(() => {
    if (phase !== "active") return;
    if (timerSeconds <= 0) return;

    const timeoutId = window.setTimeout(() => {
      setTimerSeconds((seconds) => seconds - 1);
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [phase, timerSeconds]);

  async function joinLobby() {
    if (requiresDisplayName && (displayName.trim().length === 0 || email.trim().length === 0)) {
      return;
    }
    
    let createdParticipantId: string | undefined = undefined;
    if (displayName.trim().length > 0) {
      try {
        const pRes = await apiClient.post<any>("/participants", { name: displayName, email });
        createdParticipantId = pRes.id || pRes.data?.id;
        setParticipantId(createdParticipantId || null);
      } catch (err) {
        toast.error("Failed to register participant details");
      }
    }

    joinRoom(assessment.id, RoomRole.PARTICIPANT, createdParticipantId, displayName);
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
    
    if (participantId) {
      const timeSpentMs = (12 - timerSeconds) * 1000;
      emitSubmitAnswer(currentRound.id, participantId, value, timeSpentMs);
    }
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
              requiresDisplayName={requiresDisplayName}
              displayName={displayName}
              onDisplayNameChange={setDisplayName}
              email={email}
              onEmailChange={setEmail}
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

        {phase === "active" ? (
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

        {roomState.questionResults ? (
          <JoinResult
            currentRound={currentRound}
            answerValue={answerValue}
            isCorrect={roomState.questionResults?.correct}
            lastPoints={roomState.questionResults?.points || 0}
            totalScore={totalScore}
            speedBonus={speedBonus}
            isLastQuestion={questionIndex === rounds.length - 1}
          />
        ) : null}

        {phase === "results" ? (
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
