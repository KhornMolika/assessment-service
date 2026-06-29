"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { RealtimeEvents, RoomRole } from "@/src/types/runtime.types";
import { getRealtimeUrl } from "@/src/lib/actions/runtime.actions";
import { toast } from "sonner";

export interface RoomState {
  roomId: string | null;
  phase: "lobby" | "waiting" | "active" | "correct" | "leaderboard" | "results";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  participants: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentQuestion: any | null;
  endTime: string | null;
  questionNumber: number;
  totalQuestions: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  questionResults: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  leaderboard: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  myRank: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  myResult: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pendingLeaderboard: any | null;
}

const initialRoomState: RoomState = {
  roomId: null,
  phase: "lobby",
  participants: [],
  currentQuestion: null,
  endTime: null,
  questionNumber: 0,
  totalQuestions: 0,
  questionResults: null,
  leaderboard: null,
  myRank: null,
  myResult: null,
  pendingLeaderboard: null,
};

export function useRealtimeSession(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState>(initialRoomState);

  const socketRef = useRef<Socket | null>(null);
  const joinParamsRef = useRef<{ roomId: string, role: RoomRole, participantId?: string, name?: string } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const currentQuestionRef = useRef<any>(null);

  useEffect(() => {
    currentQuestionRef.current = roomState.currentQuestion;
  }, [roomState.currentQuestion]);

  useEffect(() => {
    if (!enabled) return;

    let activeSocket: Socket;

    async function initSocket() {
      const baseUrl = await getRealtimeUrl();
      const url = baseUrl || "http://localhost:3001";
      
      activeSocket = io(`${url}/realtime`, {
        transports: ["websocket"],
      });

      activeSocket.on("connect", () => {
        setIsConnected(true);
        if (joinParamsRef.current) {
          activeSocket.emit(RealtimeEvents.JOIN_ROOM, joinParamsRef.current);
        }
      });
      activeSocket.on("disconnect", () => setIsConnected(false));

      activeSocket.on(RealtimeEvents.ROOM_UPDATE, (data) => {
        setRoomState((prev) => ({
          ...prev,
          participants: data.participants || prev.participants,
          questionResults:
            typeof data.totalAnswered === "number"
              ? {
                  ...(prev.questionResults || {}),
                  totalAnswered: data.totalAnswered,
                  totalParticipants: data.totalParticipants,
                }
              : prev.questionResults,
        }));
      });

      activeSocket.on(RealtimeEvents.NEW_QUESTION, (data) => {
        // Backend returns: { questionNumber, totalQuestions, q, options, endTime }
        const rawOptions = data.options;
        const parsedOptions = Array.isArray(rawOptions)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? rawOptions.map((option: any, index: number) => ({
              ...option,
              label: option.label || String.fromCharCode(65 + index),
            }))
          : typeof rawOptions === "object" && rawOptions !== null && rawOptions.leftSide
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? [...(rawOptions.leftSide || []), ...(rawOptions.rightSide || [])].map((opt: any, i: number) => ({
                ...opt,
                label: String.fromCharCode(65 + i),
              }))
            : [];
        const parsedQuestion = data.q
          ? {
              ...data.q,
              id: data.q.assessmentQuestionId || data.q.id,
              question: data.q.question || data.q.questionText || "",
              questionText: data.q.questionText || data.q.question || "",
              points: Number(data.q.points ?? 0),
              options: parsedOptions,
              rawOptions,
              correctOptionId: "",
            }
          : data;
        setRoomState((prev) => ({ 
          ...prev, 
          phase: "active", 
          currentQuestion: parsedQuestion,
          endTime: data.endTime || null,
          questionNumber: data.questionNumber || 0,
          totalQuestions: data.totalQuestions || 0,
          questionResults: null,
          myResult: null,
          pendingLeaderboard: null,
        }));
      });

      activeSocket.on(RealtimeEvents.Q_RESULTS, (data) => {
        setRoomState((prev) => ({ ...prev, phase: "correct", questionResults: data }));
      });

      activeSocket.on(RealtimeEvents.SHOW_RANK, (data) => {
        const isHostRankPayload = joinParamsRef.current?.role === RoomRole.HOST;
        setRoomState((prev) => ({
          ...prev,
          phase: isHostRankPayload ? prev.phase : "leaderboard",
          leaderboard: data.top5,
          pendingLeaderboard: isHostRankPayload ? data.top5 : null,
          myRank: data.myRank ?? prev.myRank,
          myResult: data.myResult ?? null,
        }));
      });

      activeSocket.on(RealtimeEvents.SHOW_FINAL_RANK, (data) => {
        setRoomState((prev) => ({
          ...prev,
          phase: "results",
          leaderboard: Array.isArray(data) ? data : data.leaderboard,
          pendingLeaderboard: null,
          myResult: null,
        }));
      });

      activeSocket.on(RealtimeEvents.SESSION_ENDED, () => {
        setRoomState((prev) => ({ ...prev, phase: "results" }));
      });

      activeSocket.on(RealtimeEvents.ERROR, (error) => {
        toast.error(error.message || "Realtime error occurred");
      });

      setSocket(activeSocket);
      socketRef.current = activeSocket;
    }

    initSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [enabled]);

  const joinRoom = useCallback((roomId: string, role: RoomRole, participantId?: string, name?: string) => {
    if (!socketRef.current) return;
    
    joinParamsRef.current = { roomId, role, participantId, name };

    setRoomState({
      ...initialRoomState,
      roomId,
      phase: role === RoomRole.HOST ? "lobby" : "waiting",
    });
    socketRef.current.emit(RealtimeEvents.JOIN_ROOM, { roomId, role, participantId, name });
  }, []);

  const resetRoomState = useCallback(() => {
    setRoomState(initialRoomState);
  }, []);

  const showStoredLeaderboard = useCallback(() => {
    setRoomState((prev) => ({
      ...prev,
      phase: "leaderboard",
      leaderboard: prev.pendingLeaderboard ?? prev.leaderboard,
      pendingLeaderboard: null,
    }));
  }, []);

  const emitStartQuestion = useCallback((questionId?: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit(RealtimeEvents.START_Q, { questionId, roomId: joinParamsRef.current?.roomId });
  }, []);

  const emitRevealAnswers = useCallback((roomId?: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit(RealtimeEvents.REVEAL_ANSWERS, { roomId });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const emitSubmitAnswer = useCallback((response: any, timeTaken: number) => {
    if (!socketRef.current) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let payload: any = { response };
    const type = currentQuestionRef.current?.type;

    if (Array.isArray(response)) {
      payload = { response: { optionIds: response, sequence: response } };
    } else if (typeof response === "boolean") {
      payload = { choice: String(response) };
    } else if (typeof response === "string") {
      payload = { choice: response };
    } else if (typeof response === "object" && response !== null) {
      if (type === "MATCHING") {
        payload = {
          response: {
            pairs: Object.entries(response).map(([leftId, rightId]) => ({
              leftId,
              rightId,
            })),
          },
        };
      } else if (type === "FILL_IN_THE_BLANK") {
        payload = {
          response: {
            answers: Object.keys(response)
              .sort()
              .map((k) => (response as Record<string, string>)[k]),
          },
        };
      } else {
        payload = { response };
      }
    }

    socketRef.current.emit(RealtimeEvents.SUBMIT_ANS, {
      roomId: joinParamsRef.current?.roomId,
      ...payload,
      timeTaken,
    });
  }, []);

  return {
    socket,
    isConnected,
    roomState,
    resetRoomState,
    showStoredLeaderboard,
    joinRoom,
    emitStartQuestion,
    emitRevealAnswers,
    emitSubmitAnswer,
  };
}

export type RealtimeSessionReturn = ReturnType<typeof useRealtimeSession>;
