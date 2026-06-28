import type {
  AssessmentDetailQuestionItem,
} from "@/src/types";

export type ResultReleaseMode = "immediate" | "manual" | "hidden";
export type RealtimeEventDirection = "client-to-server" | "host-to-server" | "server-to-room";

export type QuestionOption = {
  id: string;
  label: string;
  text: string;
};

export type QuestionRound = AssessmentDetailQuestionItem & {
  options: QuestionOption[];
  correctOptionId: string;
  correctOptionIds?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawOptions?: any;
};

export type LeaderboardEntry = {
  id: string;
  name: string;
  score: number;
  streak: number;
  lastGain: number;
  rank: number;
  previousRank: number;
};

export type ParticipantStatus = "READY" | "WAITING" | "CONNECTED";

export type RoomParticipant = {
  id: string;
  name: string;
  status: ParticipantStatus;
};

export type RealtimeParticipant = RoomParticipant;

export type HostPhase = "lobby" | "reveal" | "correct" | "leaderboard" | "winner";

export type JoinPhase = "lobby" | "waiting" | "pick_option" | "result" | "final";

export type RealtimeRankEntry = {
  id: string;
  name: string;
  score: number;
  rank: number;
};

export type RealtimeRoomStats = {
  optionId: string;
  count: number;
};

export type RealtimeClientToServerEvents = {
  JOIN_ROOM: {
    roomId: string;
    userId: string;
  };
  SUBMIT_ANS: {
    choice: string;
    timeTaken: number;
  };
};

export type RealtimeHostToServerEvents = {
  START_Q: {
    questionId: string;
  };
};

export type RealtimeServerToRoomEvents = {
  ROOM_UPDATE: {
    count: number;
    users: RoomParticipant[];
  };
  NEW_QUESTION: {
    q: string;
    options: QuestionOption[];
    endTime: string;
  };
  Q_RESULTS: {
    correct: string;
    stats: RealtimeRoomStats[];
  };
  SHOW_RANK: {
    top5: RealtimeRankEntry[];
    myRank?: RealtimeRankEntry;
  };
  SHOW_FINAL_RANK: RealtimeRankEntry[];
};

export type RealtimeEventPayloads =
  & RealtimeClientToServerEvents
  & RealtimeHostToServerEvents
  & RealtimeServerToRoomEvents;

export type RealtimeEventName = keyof RealtimeEventPayloads;
