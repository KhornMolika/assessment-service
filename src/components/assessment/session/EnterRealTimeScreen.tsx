"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Clock3, Radio } from "lucide-react";
import type { AssessmentCatalogItem } from "@/src/types";
import { QuestionRenderer } from "../renderers/QuestionRenderer";
import type { QuestionRendererValue } from "../renderers/types";
import type { QuestionRound } from "@/src/types/session.types";
import { ScreenShell } from "./SessionShared";
import { JoinFinal } from "./join/JoinFinal";
import { JoinLobby } from "./join/JoinLobby";
import { JoinResult } from "./join/JoinResult";
import { JoinWaitingState } from "./join/JoinWaitingState";
import { realtimeEvents } from '@/src/lib/session/realtime.events';
import {
  buildQuestionRounds,
  hasAnswerResponse,
  requiresParticipantIdentity,
} from '@/src/lib/session/session.utils';
import { useRealtimeSession, type RealtimeSessionReturn } from "@/src/hooks/use-realtime-session";
import { RoomRole } from "@/src/types/runtime.types";
import { joinRealTimeSessionAction } from "@/src/lib/actions/assessment.actions";
import { toast } from "sonner";

const QUESTION_DURATION_SECONDS = 30;
const SPEED_BONUS_RATIO = 0.5;

export function EnterRealTimeScreen({
  assessment,
  embedded,
  session: externalSession,
  onPreviewParticipantJoined,
}: {
  assessment: AssessmentCatalogItem;
  embedded?: boolean;
  session?: RealtimeSessionReturn;
  onPreviewParticipantJoined?: (participant: { id: string; name: string }) => void;
}) {
  const internalSession = useRealtimeSession({ enabled: !externalSession });
  const activeSession = externalSession || internalSession;
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
  const requiresIdentity = requiresParticipantIdentity(assessment.settings?.participantIdentity || "EXTERNAL");
  
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(12);
  const [answerValue, setAnswerValue] = useState<QuestionRendererValue>(null);
  const [totalScore, setTotalScore] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [lastAwardedPoints, setLastAwardedPoints] = useState(0);
  const [submittedSpeedBonus, setSubmittedSpeedBonus] = useState(0);
  const awardedQuestionRef = useRef<string | null>(null);
  const backendScoreAppliedQuestionRef = useRef<string | null>(null);
  const scoreBeforeQuestionRef = useRef(0);
  const totalScoreRef = useRef(0);

  const { isConnected, roomState, joinRoom, emitSubmitAnswer } = activeSession;

  const currentRound = roomState.currentQuestion || rounds[0];
  const phase = roomState.phase;
  const questionNumber = roomState.questionNumber || questionIndex + 1;
  const totalQuestions = roomState.totalQuestions || rounds.length;
  const currentPoints = Number.isFinite(Number(currentRound.points))
    ? Number(currentRound.points)
    : 0;
  const timerProgressPercent = Math.max(
    0,
    Math.min(100, (timerSeconds / QUESTION_DURATION_SECONDS) * 100),
  );
  const hasTimedOut = phase === "active" && timerSeconds <= 0;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const speedBonus = getRealtimeSpeedBonus(currentPoints, timerSeconds);
  const isLobbyPhase = phase === "lobby";
  const resultQuestionId =
    typeof roomState.myResult?.questionId === "string" ? roomState.myResult.questionId : null;
  const hasCurrentRoundResult =
    Boolean(currentRound?.id) && resultQuestionId === currentRound.id;
  const backendCorrect =
    hasCurrentRoundResult && typeof roomState.myResult?.correct === "boolean"
      ? roomState.myResult.correct
      : undefined;
  const revealedCorrect =
    backendCorrect ?? isAnswerCorrectFromReveal(roomState.questionResults?.correct, answerValue);

  useEffect(() => {
    totalScoreRef.current = totalScore;
  }, [totalScore]);

  // Reset local state when a new question starts
  useEffect(() => {
    if (phase === "active") {
      setTimerSeconds(QUESTION_DURATION_SECONDS);
      setAnswerValue(null);
      setLastAwardedPoints(0);
      setSubmittedSpeedBonus(0);
      awardedQuestionRef.current = null;
      backendScoreAppliedQuestionRef.current = null;
      scoreBeforeQuestionRef.current = totalScoreRef.current;
      setQuestionIndex(Math.max(0, (roomState.questionNumber || 1) - 1));
    }
  }, [phase, currentRound?.id, roomState.questionNumber]);

  useEffect(() => {
    if (phase !== "active" || !roomState.endTime) return;

    const tick = () => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(roomState.endTime!).getTime() - Date.now()) / 1000),
      );
      setTimerSeconds(remaining);
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [phase, roomState.endTime]);

  async function joinLobby() {
    if (requiresIdentity && (displayName.trim().length === 0 || email.trim().length === 0)) {
      return;
    }
    
    let createdParticipantId: string | undefined = undefined;
    if (displayName.trim().length > 0) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const payload: any = { name: displayName };
        if (email.trim().length > 0) {
          payload.email = email;
        }
        
        const pRes = await joinRealTimeSessionAction(assessment.id, payload);
        if (!pRes.success) {
          throw new Error(pRes.error);
        }
        
        createdParticipantId =
          pRes.data?.id ||
          pRes.data?.data?.id ||
          pRes.data?.data?.data?.id ||
          pRes.data?.participant?.id ||
          pRes.data?.data?.participant?.id;
        setParticipantId(createdParticipantId || null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Participant registration failed:", err);
        const msg = err?.response?.data?.message || err.message || "Failed to register participant details";
        toast.error(typeof msg === 'string' ? msg : JSON.stringify(msg));
        return;
      }
    }

    if (!isConnected) {
      toast.error("Realtime connection is still starting. Please try again in a moment.");
      return;
    }

    const participantName = displayName.trim() || "Anonymous";
    const roomParticipantId =
      createdParticipantId ||
      `preview-${participantName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
    
    setParticipantId(roomParticipantId);
    onPreviewParticipantJoined?.({ id: roomParticipantId, name: participantName });
    joinRoom(assessment.id, RoomRole.PARTICIPANT, roomParticipantId, participantName);
  }

  const [submitted, setSubmitted] = useState(false);

  function selectAnswer(value: QuestionRendererValue) {
    if (submitted) return; // prevent changing after submit
    setAnswerValue(value);
  }

  function handleSubmit() {
    if (!hasAnswerResponse(currentRound, answerValue) || submitted || hasTimedOut) return;
    setSubmitted(true);
    scoreBeforeQuestionRef.current = totalScore;
    const roundSpeedBonus = getRealtimeSpeedBonus(currentPoints, timerSeconds);
    setSubmittedSpeedBonus(roundSpeedBonus);
    
    if (participantId) {
      const timeSpentSecs = QUESTION_DURATION_SECONDS - timerSeconds;
      emitSubmitAnswer(answerValue, timeSpentSecs);
    }
  }

  // Reset submitted state when new question arrives
  useEffect(() => {
    if (phase === "active") {
      setSubmitted(false);
    }
  }, [phase, currentRound?.id]);

  useEffect(() => {
    if (!roomState.questionResults || phase === "active") return;
    if (awardedQuestionRef.current === currentRound.id) return;

    awardedQuestionRef.current = currentRound.id;
    const correct =
      hasCurrentRoundResult && typeof roomState.myResult?.correct === "boolean"
        ? roomState.myResult.correct
        : isAnswerCorrectFromReveal(roomState.questionResults.correct, answerValue);
    
    if (correct) {
      setStreakCount((count) => count + 1);
    } else {
      setStreakCount(0);
    }
  }, [
    answerValue,
    currentRound?.id,
    hasCurrentRoundResult,
    phase,
    revealedCorrect,
    roomState.myResult?.correct,
    roomState.questionResults,
  ]);

  // Sync total score with backend truth when it arrives and calculate exact points earned
  useEffect(() => {
    if (roomState.myRank?.score !== undefined && hasCurrentRoundResult) {
      const resultTotalScore = Number(roomState.myResult?.totalScore);
      const rankScore = Number(roomState.myRank.score);
      const newScore = Number.isFinite(resultTotalScore)
        ? Math.max(0, resultTotalScore)
        : Number.isFinite(rankScore)
          ? Math.max(0, rankScore)
          : totalScoreRef.current;
      setTotalScore(newScore);

      if (phase !== "active") {
        if (backendScoreAppliedQuestionRef.current !== currentRound?.id) {
          backendScoreAppliedQuestionRef.current = currentRound?.id || null;
          const resultPoints = Number(roomState.myResult?.pointsEarned);
          const resultSpeedBonus = Number(roomState.myResult?.speedBonus);
          const delta = Number.isFinite(resultPoints)
            ? Math.max(0, resultPoints)
            : Math.max(0, newScore - scoreBeforeQuestionRef.current);
          const backendSpeedBonus = Number.isFinite(resultSpeedBonus)
            ? Math.max(0, resultSpeedBonus)
            : revealedCorrect
              ? Math.max(0, delta - currentPoints)
              : 0;
          setLastAwardedPoints(delta);
          setSubmittedSpeedBonus(backendSpeedBonus);
        }
      }
    }
  }, [
    answerValue,
    currentPoints,
    currentRound?.id,
    hasCurrentRoundResult,
    phase,
    revealedCorrect,
    roomState.myRank?.score,
    roomState.myResult?.correct,
    roomState.myResult?.questionId,
    roomState.myResult?.pointsEarned,
    roomState.myResult?.speedBonus,
    roomState.myResult?.totalScore,
    roomState.questionResults?.correct,
  ]);

  return (
    <ScreenShell
      eyebrow={isLobbyPhase ? "Real-time Participant Flow" : ""}
      title={isLobbyPhase ? assessment.name || "Untitled" : ""}
      description={isLobbyPhase ? assessment.description ?? "" : ""}
      variant={embedded ? "panel" : "page"}
      aside={null}
      headerAction={
        phase === "active" ? (
          <div className="flex flex-col items-end gap-1.5 sm:gap-2">
            <div
              className={`shrink-0 rounded-xl sm:rounded-3xl border border-white/15 bg-white/10 px-2.5 py-1.5 sm:px-4 sm:py-2 text-right backdrop-blur ${
                timerSeconds <= 5 ? "rt-timer-critical text-[#F94144]" : "text-primary/75 bg-primary/5"
              }`}
            >
              <div className="flex items-center justify-end gap-1.5 sm:gap-2">
                <Clock3 className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.16em]">
                  Time left
                </span>
                <span className="ml-2 text-lg sm:text-2xl font-black">{timerSeconds}s</span>
              </div>
            </div>
            <div className="rt-progress-shimmer w-full max-w-[200px] h-1.5 sm:h-2 rounded-full bg-primary/10">
              <div
                className={`h-full rounded-full transition ${
                  timerSeconds <= 5
                    ? "bg-[linear-gradient(90deg,#FF6B6F_0%,#F94144_100%)]"
                    : "bg-[linear-gradient(90deg,#FFD166_0%,#95D5B2_100%)]"
                }`}
                style={{ width: `${timerProgressPercent}%` }}
              />
            </div>
          </div>
        ) : null
      }
    >
      <div className="flex flex-1 h-full min-h-0 flex-col">
        {phase === "lobby" ? (
          <div className="flex min-h-0 flex-1 items-center py-1">
            <JoinLobby
              requiresIdentity={requiresIdentity}
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
          <div className="flex flex-1 items-center justify-center min-h-[50vh]">
            <JoinWaitingState
              title="Waiting for host to start..."
              description="The first question opens when the host starts the round."
            />
          </div>
        ) : null}

        {phase === "active" ? (
          <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col overflow-y-auto py-1 sm:py-4">
            <div className="rt-card-pop overflow-hidden rounded-[20px] sm:rounded-[30px] border border-[#1C5C45]/15 bg-white shadow-[0_24px_70px_rgba(27,67,50,0.10)]">
              <div className="border-b border-border/60 bg-[linear-gradient(135deg,#16352A_0%,#23513D_58%,#2D6A4F_100%)] p-2.5 sm:p-5 text-white">
                <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full bg-white/10 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
                    <Radio className="h-3 w-3 sm:h-4 sm:w-4 text-[#95D5B2]" />
                    Live question
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-semibold text-white/85">
                    Question {questionNumber} of {totalQuestions}
                  </div>
                </div>

                <div className="mt-2 sm:mt-4">
                  <h2 className="max-w-3xl text-base font-bold leading-snug tracking-tight sm:text-2xl">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {currentRound.question || (currentRound as any).questionText}
                  </h2>
                </div>
              </div>

              <div className="bg-[linear-gradient(180deg,#FFFEF8_0%,#F7F5F0_100%)] p-3 sm:p-5">
                <div className="w-full" data-flow-event={realtimeEvents.submitAnswer}>
                  <QuestionRenderer
                    question={currentRound}
                    value={answerValue}
                    onChange={selectAnswer}
                    disabled={submitted || hasTimedOut}
                  />
                </div>
              </div>
            </div>

            <div className="mx-auto mt-2 sm:mt-4 w-full max-w-md">
              {submitted ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl bg-[#113023] px-4 py-3 sm:px-6 sm:py-4 text-center text-sm sm:text-base font-bold text-white shadow-[0_18px_40px_rgba(17,48,35,0.18)]">
                  <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                  Answer submitted! Waiting for results…
                </div>
              ) : hasTimedOut ? (
                <div className="flex items-center justify-center gap-2 rounded-2xl border border-[#FFD166]/60 bg-[#FFF6CC] px-4 py-3 sm:px-6 sm:py-4 text-center text-sm sm:text-base font-bold text-[#113023] shadow-sm">
                  <Clock3 className="h-5 w-5" />
                  Time is up. Waiting for results…
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!hasAnswerResponse(currentRound, answerValue)}
                  className="w-full rounded-2xl bg-gradient-to-r from-[#FFD166] to-[#F9C74F] px-4 py-3 sm:px-6 sm:py-4 text-sm sm:text-base font-bold text-[#113023] shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                >
                  Submit Answer
                </button>
              )}
            </div>
          </div>
        ) : null}

        {roomState.questionResults && phase !== "active" && phase !== "results" ? (
          hasCurrentRoundResult ? (
            <JoinResult
              currentRound={currentRound}
              answerValue={answerValue}
              isCorrect={revealedCorrect}
              lastPoints={Number.isFinite(lastAwardedPoints) ? lastAwardedPoints : 0}
              totalScore={Number.isFinite(totalScore) ? totalScore : 0}
              speedBonus={submittedSpeedBonus}
              isLastQuestion={questionIndex === rounds.length - 1}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center h-full">
              <JoinWaitingState
                title="Checking your result..."
                description="Your score will appear as soon as this round result is ready."
              />
            </div>
          )
        ) : null}

        {phase === "results" ? (
          <JoinFinal
            displayName={displayName}
            totalScore={totalScore}
            rank={roomState.myRank?.rank ? `#${roomState.myRank.rank}` : "-"}
            streakCount={streakCount}
          />
        ) : null}
      </div>
    </ScreenShell>
  );
}

function getRealtimeSpeedBonus(questionPoints: number, timerSeconds: number): number {
  if (!Number.isFinite(questionPoints) || questionPoints <= 0) return 0;
  const timeRatio = Math.max(0, Math.min(1, timerSeconds / QUESTION_DURATION_SECONDS));
  return questionPoints * SPEED_BONUS_RATIO * timeRatio;
}

function parseCorrectAnswer(correct: unknown): unknown {
  if (typeof correct !== "string") return correct;
  try {
    return JSON.parse(correct);
  } catch {
    return correct;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAnswerCorrectFromReveal(
  correct: unknown,
  answerValue: QuestionRendererValue,
): boolean {
  if (!hasAnswerResponse({ options: [], type: "SINGLE_CHOICE" } as QuestionRound, answerValue)) {
    return false;
  }

  const parsed = parseCorrectAnswer(correct);
  if (Array.isArray(answerValue)) {
    const sequence = isRecord(parsed) && Array.isArray(parsed.sequence) ? parsed.sequence : null;
    if (sequence) {
      return (
        answerValue.length === sequence.length &&
        answerValue.every((id, index) => id === sequence[index])
      );
    }
    const correctIds = isRecord(parsed) && Array.isArray(parsed.optionIds)
      ? parsed.optionIds
      : Array.isArray(parsed)
        ? parsed
        : [];
    return (
      answerValue.length === correctIds.length &&
      answerValue.every((id) => correctIds.includes(id))
    );
  }

  if (typeof answerValue === "object" && answerValue !== null && !Array.isArray(answerValue)) {
    const pairs = isRecord(parsed) && Array.isArray(parsed.pairs) ? parsed.pairs : null;
    if (pairs) {
      return pairs.every(
        (pair) => {
          if (!isRecord(pair)) return false;
          const lId = typeof pair.leftId === "string" ? pair.leftId : pair.left;
          const rId = typeof pair.rightId === "string" ? pair.rightId : pair.right;
          if (typeof lId !== "string" || typeof rId !== "string") return false;
          if (!lId || !rId) return false;
          return answerValue[lId] === rId;
        }
      );
    }
  }

  // FILL IN THE BLANK
  if (typeof answerValue === "object" && answerValue !== null && !Array.isArray(answerValue) && isRecord(parsed) && Array.isArray(parsed.answers)) {
    const acceptedAnswers = parsed.answers as string[][];
    // answerValue is like { "0": "val1", "1": "val2" }
    return acceptedAnswers.every((accepted, index) => {
      const given = (answerValue[String(index)] ?? "").trim().toLowerCase();
      return accepted.some((a) => a.trim().toLowerCase() === given);
    });
  }

  if (typeof answerValue === "boolean" || typeof answerValue === "string") {
    const pVal = isRecord(parsed) && parsed.value !== undefined ? parsed.value : parsed;
    
    // Case-insensitive comparison for short answer
    if (String(pVal).trim().toLowerCase() === String(answerValue).trim().toLowerCase()) return true;
    if (isRecord(parsed) && parsed.optionId && String(parsed.optionId) === String(answerValue)) return true;
  }



  return false;
}
