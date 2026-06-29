# Assessment Session Pages and Components

This note describes the route pages and the files under `src/domains/assessment/components/session/`.

## Route pages

- `src/app/assessments/[id]/take/page.tsx`
  Self-paced participant page. Loads assessment detail data and renders the self-paced participant flow with `AssessmentTakeScreen`.

- `src/app/assessments/[id]/join/page.tsx`
  Real-time participant page. Loads the assessment summary for the live join experience and renders `AssessmentJoinScreen`.

- `src/app/assessments/[id]/host/page.tsx`
  Real-time host page. Loads assessment detail data and renders `AssessmentHostScreen`.

- `src/app/assessments/[id]/self-paced-preview/page.tsx`
  Creator dry-run page for the self-paced participant flow. Uses `AssessmentPreviewScreen` in `SELF_PACED` mode and returns to `/assessments/[id]`.

- `src/app/assessments/[id]/real-time-preview/page.tsx`
  Creator preview page for the real-time experience. Shows host and participant flows side by side and returns to `/assessments/[id]`.

## Main session entry file

- `AssessmentSessionScreens.tsx`
  Re-export file only. Keeps route imports stable while the internals are split across smaller files.

## Top-level screen files

- `AssessmentTakeScreen.tsx`
  Self-paced participant screen controller. Owns step state, timer state, answer state, scoring, and renders the self-paced phase components.

- `AssessmentPreviewScreen.tsx`
  Creator preview screen controller. Handles both preview modes:
  - `SELF_PACED`: interactive dry run with evaluation in UI only
  - `REAL_TIME`: preview-only page content for the real-time participant structure

- `AssessmentHostScreen.tsx`
  Real-time host screen controller. Owns lobby, reveal, correct, leaderboard, and winner phases plus host audio, timers, copy-link state, and leaderboard state.

- `AssessmentJoinScreen.tsx`
  Real-time participant screen controller. Owns lobby, waiting-to-start, active answer, round result, and final standing phases.

## Shared session building blocks

- `SessionShared.tsx`
  Shared visual primitives used across multiple flows.

  Components in this file:

- `ScreenShell`
  Fullscreen session page shell. Handles page-level header area, panel/page variants, and inner scrolling behavior.

- `AssessmentOverviewCard`
  Snapshot card used in self-paced entry side panels.

- `FlowStepper`
  Top step indicator used in self-paced flows.

- `QuestionOptionButton`
  Shared answer option button. Supports both default styling and real-time styling.

- `TimeLimitCard`
  Displays the configured self-paced time limit.

- `QuizTimerCard`
  Displays the self-paced countdown timer and progress bar.

- `ShareAnswerSheetPanel`
  Displays sharing actions for the answer sheet when sharing is enabled.

- `ProcessingAnswersCard`
  Loading state shown after submission while results are being processed in the UI.

## Shared session helpers

- `session.types.ts`
  Local session UI types such as:
  - `ResultReleaseMode`
  - `QuestionOption`
  - `QuestionRound`
  - `LeaderboardEntry`
  - `RoomParticipant`
  - `RealtimeClientToServerEvents`
  - `RealtimeHostToServerEvents`
  - `RealtimeServerToRoomEvents`
  - `HostPhase`
  - `JoinPhase`

- `realtime.events.ts`
  Canonical real-time event constants and direction lists for the strict event map:
  - `JOIN_ROOM`
  - `ROOM_UPDATE`
  - `START_Q`
  - `NEW_QUESTION`
  - `SUBMIT_ANS`
  - `Q_RESULTS`
  - `SHOW_RANK`
  - `SHOW_FINAL_RANK`

- `session.utils.ts`
  Shared helper logic for session flows:
  - question type normalization
  - date formatting
  - participant identity label resolution
  - `show_results` mapping
  - question-round shaping
  - demo participant roster and leaderboard builders
  - leaderboard round resolution
  - chart distribution shaping
  - duration formatting
  - answer presence and correctness checks
  - answer text formatting
  - preview answer generation

- `avatar.utils.ts`
  Deterministic avatar helpers shared by host and join components. Used with `boring-avatars` to keep participant avatars stable by name/id.

- `realtime.effects.ts`
  Real-time audio hook and effect helpers for host-side sound cues.

## Self-paced phase components

Files in `src/domains/assessment/components/session/self-paced/` are shared between `AssessmentTakeScreen` and the self-paced branch of `AssessmentPreviewScreen`.

- `SelfPacedEntry.tsx`
  Entry phase UI. Handles display-name entry, time-limit display, helper copy for identity rules, optional back button, and the continue action.

- `SelfPacedQuiz.tsx`
  Quiz phase UI. Renders the progress bar, optional timer card, the current question via `QuestionRenderer`, and previous/next navigation.

- `SelfPacedConfirm.tsx`
  Confirmation phase UI. Shows the selected answers for all questions and the actions for going back or submitting.

- `SelfPacedResult.tsx`
  End-state UI. Renders result summary, optional sharing panel, and the answer sheet with correct/incorrect styling.

## Real-time host phase components

Files in `src/domains/assessment/components/session/host/` are used by `AssessmentHostScreen`.

- `HostLobby.tsx`
  Lobby phase UI. Shows the QR code, join link, copy/start controls, sound toggle, question count, ready count, and participant roster.

- `HostReveal.tsx`
  Reveal phase UI. Shows live timer, response count, question content, and the host action to move to the correct-answer phase.

- `HostCorrect.tsx`
  Correct-answer phase UI. Shows the column chart distribution, highlights the correct option, and provides the next action to move to the leaderboard.

- `HostLeaderboard.tsx`
  Leaderboard phase UI. Shows the animated ranking list, rank movement, gap to lead, streak badge, round gain, and the action to advance.

- `HostWinner.tsx`
  Winner podium UI. Shows the final top-three podium and the button back to the assessment detail page.

## Real-time join phase components

Files in `src/domains/assessment/components/session/join/` are used by `AssessmentJoinScreen`.

- `JoinLobby.tsx`
  Participant join lobby. Collects display name and explains that the participant waits for the host to start.

- `JoinWaitingState.tsx`
  Minimal waiting screen shown after the participant joins and before the host starts.

- `JoinResult.tsx`
  Round result phase UI. Shows correct/wrong status, points earned, total score, and the local preview action for host advance.

- `JoinFinal.tsx`
  Final minimalist result card. Shows avatar, participant name, total score, rank, and optional streak badge.

## Editing guidance

- If you need to change fullscreen shell layout, page/panel behavior, or reusable visual primitives, start in `SessionShared.tsx`.

- If you need to change self-paced participant or self-paced preview layout, start in:
  - `AssessmentTakeScreen.tsx`
  - `AssessmentPreviewScreen.tsx`
  - `self-paced/*`

- If you need to change real-time host UI, start in:
  - `AssessmentHostScreen.tsx`
  - `host/*`

- If you need to change real-time participant UI, start in:
  - `AssessmentJoinScreen.tsx`
  - `join/*`

- If you need to change local demo/session state logic, update:
  - `session.types.ts`
  - `realtime.events.ts`
  - `session.utils.ts`
  - `realtime.effects.ts` for audio-related behavior
