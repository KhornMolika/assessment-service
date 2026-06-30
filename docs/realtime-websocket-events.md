# Real-Time WebSocket Events

This spec tracks the real-time mode event contract used by the current session UI:

- `/assessments/[id]/host`
- `/assessments/[id]/join`
- `/assessments/[id]/real-time-preview`

The canonical frontend constants live in:

- `src/domains/assessment/components/session/realtime.events.ts`
- `src/domains/assessment/components/session/session.types.ts`

## Current UI Flow

### Host flow

1. Lobby
2. Reveal
3. Correct
4. Leaderboard
5. Winner podium

### Participant flow

1. Lobby
2. Waiting
3. Pick option
4. Round result
5. Final

## Strict Event Map

| Event name | Direction | Payload | Outcome |
|---|---|---|---|
| `JOIN_ROOM` | Client -> Server | `{ roomId, userId }` | Server adds participant to room and updates the Redis Set. |
| `ROOM_UPDATE` | Server -> Room | `{ count, users[] }` | Host sees live join count and roster updates. |
| `START_Q` | Host -> Server | `{ questionId }` | Server fetches the question from Redis and pushes it to the room. |
| `NEW_QUESTION` | Server -> Room | `{ q, options, endTime }` | Participants see options and the timer starts. |
| `SUBMIT_ANS` | Client -> Server | `{ choice, timeTaken }` | Server updates the Redis Sorted Set score. |
| `Q_RESULTS` | Server -> Room | `{ correct, stats }` | Triggered when `endTime` hits or host clicks next/reveal. |
| `SHOW_RANK` | Server -> Room | `{ top5, myRank }` | Server pulls rank data from Redis `ZREVRANGE`. |
| `SHOW_FINAL_RANK` | Server -> Room | `[{ id, name, score, rank }, ...]` | Triggers the winner podium animation. |

## Shared Types

```ts
export type ParticipantStatus = "READY" | "WAITING" | "CONNECTED";

export type RoomParticipant = {
  id: string;
  name: string;
  status: ParticipantStatus;
};

export type QuestionOption = {
  id: string;
  label: string;
  text: string;
};

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
```

## TypeScript Event Maps

```ts
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
```

## UI Mapping

### Host lobby

- Emits `START_Q` when the host starts the first question.
- Listens for `ROOM_UPDATE` to keep participant count and roster current.

### Host reveal

- Listens for `NEW_QUESTION`.
- Moves to results when the server emits `Q_RESULTS`.
- The current local demo marks the skip/reveal control with `data-flow-event="Q_RESULTS"`.

### Host correct

- Renders the answer distribution from `Q_RESULTS.stats`.
- Emits the next rank action that maps to `SHOW_RANK`.

### Host leaderboard

- Listens for `SHOW_RANK`.
- Emits another `START_Q` when moving to the next question.
- Emits or listens for `SHOW_FINAL_RANK` when the last round is complete.

### Participant lobby

- Emits `JOIN_ROOM` from the join lobby.
- Enters the local `waiting` phase after joining.

### Participant pick option

- Listens for `NEW_QUESTION`.
- Emits `SUBMIT_ANS` when the answer is selected.

### Participant result and final

- Listens for `Q_RESULTS` for correctness and round stats.
- Listens for `SHOW_RANK` for current rank.
- Listens for `SHOW_FINAL_RANK` for final standings.

## Backend Notes

- Redis Set stores room membership for `JOIN_ROOM` and `ROOM_UPDATE`.
- Redis Sorted Set stores scores used by `SUBMIT_ANS`, `SHOW_RANK`, and `SHOW_FINAL_RANK`.
- The server is authoritative for question timing. It should ignore late `SUBMIT_ANS` events after `endTime`.
- Host-only permissions should be enforced for `START_Q` and manual result/rank progression.
- The current frontend still uses local mock helpers for roster, answer distribution, and leaderboard simulation until a real WebSocket transport is added.
