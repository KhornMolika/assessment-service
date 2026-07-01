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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isRecord(value: any): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getNestedOptions(payload: any) {
  return (
    payload?.options ??
    payload?.q?.options ??
    payload?.q?.rawOptions ??
    payload?.q?.questionSnapshot?.options ??
    payload?.questionSnapshot?.options ??
    payload?.choices ??
    payload?.q?.choices ??
    payload?.items ??
    payload?.q?.items ??
    payload?.answers ??
    payload?.q?.answers ??
    null
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeOption(option: any, index: number) {
  const fallback = String(index);
  return {
    id:
      option?.id ??
      option?.optionId ??
      option?.value ??
      option?.label ??
      fallback,
    text:
      option?.text ??
      option?.optionText ??
      option?.answer ??
      option?.name ??
      option?.title ??
      option?.label ??
      option?.value ??
      String(option),
    label: option?.label || String.fromCharCode(65 + index),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeRealtimeOptions(rawOptions: any, type?: string) {
  const normalizedType = String(type ?? "").toLowerCase();
  const parsedOptions = tryParseJson(rawOptions);

  if (Array.isArray(parsedOptions)) {
    return parsedOptions.map(normalizeOption);
  }

  if (!isRecord(parsedOptions)) {
    if (
      normalizedType.includes("true_false") ||
      normalizedType.includes("true/false") ||
      normalizedType.includes("boolean")
    ) {
      return [
        { id: "true", text: "True", label: "A" },
        { id: "false", text: "False", label: "B" },
      ];
    }

    return [];
  }

  const optionArray =
    parsedOptions.options ??
    parsedOptions.choices ??
    parsedOptions.items ??
    parsedOptions.answers ??
    parsedOptions.possibleAnswers;
  if (Array.isArray(optionArray)) {
    return optionArray.map(normalizeOption);
  }

  const leftSide = parsedOptions.leftSide ?? parsedOptions.left ?? parsedOptions.prompts;
  const rightSide = parsedOptions.rightSide ?? parsedOptions.right ?? parsedOptions.matches;
  if (Array.isArray(leftSide) || Array.isArray(rightSide)) {
    return [...(leftSide || []), ...(rightSide || [])].map(normalizeOption);
  }

  if (
    normalizedType.includes("true_false") ||
    normalizedType.includes("true/false") ||
    normalizedType.includes("boolean")
  ) {
    return [
      { id: "true", text: String(parsedOptions.trueLabel ?? "True"), label: "A" },
      { id: "false", text: String(parsedOptions.falseLabel ?? "False"), label: "B" },
    ];
  }

  return [];
}

function tryParseJson(value: unknown) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRealtimeQuestionPayload(data: any) {
  const question = data.q ?? data.currentQuestion ?? data.question;
  if (!question) return null;

  const rawOptions =
    data.options ??
    question.options ??
    question.rawOptions ??
    question?.question?.options ??
    question?.question?.rawOptions ??
    getNestedOptions(data);
  const parsedOptions = normalizeRealtimeOptions(rawOptions, question.type ?? question?.question?.type ?? data.type);

  return {
    ...question,
    id: question.assessmentQuestionId || question.id,
    question: question.question || question.questionText || "",
    questionText: question.questionText || question.question || "",
    points: Number(question.points ?? 0),
    options: parsedOptions,
    rawOptions,
    correctOptionId: "",
  };
}

export function useRealtimeSession(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const serverTimeOffsetRef = useRef<number>(0);

  const getServerTime = useCallback(() => {
    return Date.now() + serverTimeOffsetRef.current;
  }, []);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState>(initialRoomState);

  const socketRef = useRef<Socket | null>(null);
  const joinParamsRef = useRef<{ roomId: string, role: RoomRole, participantId?: string, name?: string } | null>(null);
  const leaveHandlerRef = useRef<(() => void) | null>(null);
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
        if (data.serverTime) {
          serverTimeOffsetRef.current = new Date(data.serverTime).getTime() - Date.now();
        }
        // Backend returns: { questionNumber, totalQuestions, q, options, endTime, serverTime }
        const parsedQuestion = parseRealtimeQuestionPayload(data) ?? data;
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

      activeSocket.on(RealtimeEvents.ROOM_STATE, (data) => {
        if (data.serverTime) {
          serverTimeOffsetRef.current = new Date(data.serverTime).getTime() - Date.now();
        }
        const parsedQuestion = parseRealtimeQuestionPayload(data);
        setRoomState((prev) => {
          let newPhase = data.phase || prev.phase;
          if (newPhase === "lobby" && joinParamsRef.current?.role === RoomRole.PARTICIPANT) {
            newPhase = "waiting";
          }
          return {
            ...prev,
            roomId: data.roomId || prev.roomId,
            phase: newPhase,
            participants: data.participants || prev.participants,
            currentQuestion: parsedQuestion,
            endTime: data.endTime || null,
            questionNumber: data.questionNumber || 0,
            totalQuestions: data.totalQuestions || 0,
            questionResults: data.questionResults || null,
            leaderboard: data.leaderboard || prev.leaderboard,
            pendingLeaderboard: data.phase === "leaderboard" ? data.leaderboard || null : prev.pendingLeaderboard,
          };
        });
      });

      activeSocket.on(RealtimeEvents.Q_RESULTS, (data) => {
        setRoomState((prev) => ({ ...prev, phase: "correct", questionResults: data }));
      });

      activeSocket.on(RealtimeEvents.SHOW_RANK, (data) => {
        const isHostRankPayload = joinParamsRef.current?.role === RoomRole.HOST;
        setRoomState((prev) => ({
          ...prev,
          phase: isHostRankPayload
            ? prev.phase === "active"
              ? "correct"
              : prev.phase
            : "leaderboard",
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

      const leaveRoom = () => {
        if (!activeSocket.connected || !joinParamsRef.current) return;
        activeSocket.emit(RealtimeEvents.LEAVE_ROOM, {
          roomId: joinParamsRef.current.roomId,
        });
      };

      window.addEventListener("pagehide", leaveRoom);
      window.addEventListener("beforeunload", leaveRoom);
      leaveHandlerRef.current = leaveRoom;

      setSocket(activeSocket);
      socketRef.current = activeSocket;
    }

    initSocket();

    return () => {
      if (socketRef.current) {
        if (joinParamsRef.current) {
          socketRef.current.emit(RealtimeEvents.LEAVE_ROOM, {
            roomId: joinParamsRef.current.roomId,
          });
        }
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (leaveHandlerRef.current) {
        window.removeEventListener("pagehide", leaveHandlerRef.current);
        window.removeEventListener("beforeunload", leaveHandlerRef.current);
        leaveHandlerRef.current = null;
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
    getServerTime,
  };
}

export type RealtimeSessionReturn = ReturnType<typeof useRealtimeSession>;
