import type {
  RealtimeClientToServerEvents,
  RealtimeEventDirection,
  RealtimeEventName,
  RealtimeHostToServerEvents,
  RealtimeServerToRoomEvents,
} from "./session.types";

export const realtimeEvents = {
  joinRoom: "JOIN_ROOM",
  roomUpdate: "ROOM_UPDATE",
  startQuestion: "START_Q",
  newQuestion: "NEW_QUESTION",
  submitAnswer: "SUBMIT_ANS",
  questionResults: "Q_RESULTS",
  showRank: "SHOW_RANK",
  showFinalRank: "SHOW_FINAL_RANK",
} as const satisfies Record<string, RealtimeEventName>;

export const realtimeEventDirections = {
  JOIN_ROOM: "client-to-server",
  ROOM_UPDATE: "server-to-room",
  START_Q: "host-to-server",
  NEW_QUESTION: "server-to-room",
  SUBMIT_ANS: "client-to-server",
  Q_RESULTS: "server-to-room",
  SHOW_RANK: "server-to-room",
  SHOW_FINAL_RANK: "server-to-room",
} as const satisfies Record<RealtimeEventName, RealtimeEventDirection>;

export type RealtimeEmitEvent = keyof RealtimeClientToServerEvents | keyof RealtimeHostToServerEvents;
export type RealtimeListenEvent = keyof RealtimeServerToRoomEvents;

export const realtimeEmitEvents = [
  realtimeEvents.joinRoom,
  realtimeEvents.startQuestion,
  realtimeEvents.submitAnswer,
] as const satisfies readonly RealtimeEmitEvent[];

export const realtimeListenEvents = [
  realtimeEvents.roomUpdate,
  realtimeEvents.newQuestion,
  realtimeEvents.questionResults,
  realtimeEvents.showRank,
  realtimeEvents.showFinalRank,
] as const satisfies readonly RealtimeListenEvent[];
