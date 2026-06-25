export interface StartSessionDto {
  assessmentId: string;
  participantId?: string;
}

export interface SaveAnswerDto {
  assessmentQuestionId: string;
  response: any;
}

export enum RoomRole {
  HOST = "host",
  PARTICIPANT = "participant",
}

export interface JoinRoomDto {
  roomId: string;
  participantId?: string;
  role: RoomRole;
}

export interface StartQuestionDto {
  assessmentQuestionId: string;
}

export interface SubmitAnswerDto {
  assessmentQuestionId: string;
  participantId: string;
  response: any;
  timeSpentMs: number;
}

export const RealtimeEvents = {
  // Client -> Server
  JOIN_ROOM: "JOIN_ROOM",
  START_Q: "START_Q",
  SUBMIT_ANS: "SUBMIT_ANS",
  REVEAL_ANSWERS: "REVEAL_ANSWERS",

  // Server -> Room
  ROOM_UPDATE: "ROOM_UPDATE",
  NEW_QUESTION: "NEW_QUESTION",
  Q_RESULTS: "Q_RESULTS",
  SHOW_RANK: "SHOW_RANK",
  SHOW_FINAL_RANK: "SHOW_FINAL_RANK",
  SESSION_STARTED: "SESSION_STARTED",
  SESSION_ENDED: "SESSION_ENDED",

  // Server -> Individual
  SESSION_RESULT: "SESSION_RESULT",

  // Server -> Individual (errors)
  ERROR: "ERROR",
} as const;

export type RealtimeEvent = (typeof RealtimeEvents)[keyof typeof RealtimeEvents];
