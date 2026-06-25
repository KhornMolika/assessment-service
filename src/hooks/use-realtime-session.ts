"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { RealtimeEvents, RoomRole } from "@/src/types/runtime.types";
import { getRealtimeUrl } from "@/src/lib/actions/runtime.actions";
import { toast } from "sonner";

export interface RoomState {
  roomId: string | null;
  phase: "lobby" | "waiting" | "active" | "results";
  participants: any[];
  currentQuestion: any | null;
  questionResults: any | null;
  leaderboard: any | null;
}

export function useRealtimeSession() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [roomState, setRoomState] = useState<RoomState>({
    roomId: null,
    phase: "lobby",
    participants: [],
    currentQuestion: null,
    questionResults: null,
    leaderboard: null,
  });

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    let activeSocket: Socket;

    async function initSocket() {
      const baseUrl = await getRealtimeUrl();
      const url = baseUrl || "http://localhost:3001";
      
      activeSocket = io(`${url}/realtime`, {
        transports: ["websocket"],
      });

      activeSocket.on("connect", () => setIsConnected(true));
      activeSocket.on("disconnect", () => setIsConnected(false));

      activeSocket.on(RealtimeEvents.ROOM_UPDATE, (data) => {
        setRoomState((prev) => ({ ...prev, participants: data.participants || [] }));
      });

      activeSocket.on(RealtimeEvents.NEW_QUESTION, (data) => {
        setRoomState((prev) => ({ 
          ...prev, 
          phase: "active", 
          currentQuestion: data.question,
          questionResults: null 
        }));
      });

      activeSocket.on(RealtimeEvents.Q_RESULTS, (data) => {
        setRoomState((prev) => ({ ...prev, questionResults: data }));
      });

      activeSocket.on(RealtimeEvents.SHOW_RANK, (data) => {
        setRoomState((prev) => ({ ...prev, leaderboard: data.leaderboard }));
      });

      activeSocket.on(RealtimeEvents.SHOW_FINAL_RANK, (data) => {
        setRoomState((prev) => ({ ...prev, phase: "results", leaderboard: data.leaderboard }));
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
      }
    };
  }, []);

  const joinRoom = useCallback((roomId: string, role: RoomRole, participantId?: string, name?: string) => {
    if (!socketRef.current) return;
    
    setRoomState((prev) => ({ ...prev, roomId, phase: role === RoomRole.HOST ? "lobby" : "waiting" }));
    socketRef.current.emit(RealtimeEvents.JOIN_ROOM, { roomId, role, participantId, name });
  }, []);

  const emitStartQuestion = useCallback((assessmentQuestionId: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit(RealtimeEvents.START_Q, { assessmentQuestionId });
  }, []);

  const emitRevealAnswers = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit(RealtimeEvents.REVEAL_ANSWERS, {});
  }, []);

  const emitSubmitAnswer = useCallback((assessmentQuestionId: string, participantId: string, response: any, timeSpentMs: number) => {
    if (!socketRef.current) return;
    socketRef.current.emit(RealtimeEvents.SUBMIT_ANS, { assessmentQuestionId, participantId, response, timeSpentMs });
  }, []);

  return {
    socket,
    isConnected,
    roomState,
    joinRoom,
    emitStartQuestion,
    emitRevealAnswers,
    emitSubmitAnswer,
  };
}
