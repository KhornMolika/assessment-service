# CLAUDE.md — Assessment Service Frontend

Next.js 16 frontend for the Assessment Service Platform. React 19, Tailwind CSS 4, Zustand state management, OAuth2 Client Credentials API auth.

> **⚠️ Next.js 16:** This version has breaking changes from traditional Next.js. Read `node_modules/next/dist/docs/` before writing code. Heed deprecation notices.

## Project Structure

```
assessment-service/
├── src/
│   ├── app/                              # Next.js 16 App Router (NO pages/ directory)
│   │   ├── layout.tsx                    # Root layout — fonts (DM Serif Display, DM Sans, Koh Santepheap)
│   │   ├── globals.css                   # Tailwind v4 globals
│   │   ├── error.tsx                     # Route-level error boundary
│   │   ├── global-error.tsx              # Root error boundary
│   │   ├── not-found.tsx                 # 404 page
│   │   ├── (workspace)/                  # Route group: CRUD/admin pages (sidebar + topbar shell)
│   │   │   ├── layout.tsx                # Wraps children in WorkspaceShell
│   │   │   ├── page.tsx                  # Dashboard → DashboardPageView
│   │   │   ├── analytics/page.tsx        # Analytics
│   │   │   ├── assessments/
│   │   │   │   ├── page.tsx              # Catalog (filterable table)
│   │   │   │   ├── new/page.tsx          # New assessment wizard
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx          # Detail view
│   │   │   │       ├── edit/page.tsx     # Edit (reuses wizard)
│   │   │   │       └── reports/page.tsx  # Scoped results
│   │   │   ├── banks/
│   │   │   │   ├── page.tsx              # Catalog (grid)
│   │   │   │   ├── new/page.tsx          # New bank form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx          # Detail
│   │   │   │       └── edit/page.tsx     # Edit
│   │   │   ├── questions/
│   │   │   │   ├── page.tsx              # Catalog (filterable table)
│   │   │   │   ├── new/page.tsx          # New question form
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx          # Detail
│   │   │   │       └── edit/page.tsx     # Edit
│   │   │   ├── results/
│   │   │   │   ├── page.tsx              # Submissions overview
│   │   │   │   └── [id]/page.tsx         # Result sheet detail
│   │   │   ├── search/page.tsx           # Global search
│   │   │   └── topics/page.tsx           # Topics manager
│   │   └── (fullscreen)/                 # Route group: no shell — full-screen assessment views
│   │       ├── assessments/[id]/
│   │       │   ├── take/page.tsx         # Self-paced participant flow
│   │       │   ├── host/page.tsx         # Real-time host screen
│   │       │   ├── join/page.tsx         # Real-time participant join
│   │       │   ├── self-paced-preview/page.tsx   # Creator preview (self-paced)
│   │       │   └── real-time-preview/page.tsx    # Creator preview (real-time)
│   │       └── assessments/[id]/take/opengraph-image.tsx  # OG image for share links
│   ├── components/
│   │   ├── assessment/                   # Assessment domain
│   │   │   ├── api/assessment.api.ts     # All assessment API functions
│   │   │   ├── components/
│   │   │   │   ├── AssessmentShareAction.tsx          # Share modal (QR, link, preview, launch)
│   │   │   │   ├── assessment-catalog/                # Catalog page components
│   │   │   │   ├── assessment-detail/                 # Detail page components
│   │   │   │   ├── assessment-new/                    # Wizard (multi-step form)
│   │   │   │   ├── assessment-results/                # Scoped results view
│   │   │   │   ├── renderers/                         # Question renderers (one per type)
│   │   │   │   │   ├── QuestionRenderer.tsx           # Dispatcher — normalizes type, delegates
│   │   │   │   │   ├── types.ts                       # QuestionRendererProps, QuestionRendererValue
│   │   │   │   │   ├── boolean/BooleanRenderer.tsx
│   │   │   │   │   ├── essay/EssayRenderer.tsx
│   │   │   │   │   ├── file/FileUploadRenderer.tsx
│   │   │   │   │   ├── fill/FillInTheBlankRenderer.tsx
│   │   │   │   │   ├── matching/MatchingRenderer.tsx
│   │   │   │   │   ├── multiple/MultipleChoiceRenderer.tsx
│   │   │   │   │   ├── ordering/OrderingRenderer.tsx
│   │   │   │   │   ├── rating/RatingRenderer.tsx
│   │   │   │   │   ├── short/ShortAnswerRenderer.tsx
│   │   │   │   │   └── single/SingleChoiceRenderer.tsx
│   │   │   │   ├── results/                           # Results/reports components
│   │   │   │   └── session/                           # Session screen controllers
│   │   │   │       ├── AssessmentTakeScreen.tsx        # Self-paced controller
│   │   │   │       ├── AssessmentHostScreen.tsx        # Real-time host controller
│   │   │   │       ├── AssessmentJoinScreen.tsx        # Real-time participant controller
│   │   │   │       ├── AssessmentPreviewScreen.tsx     # Creator preview (both modes)
│   │   │   │       ├── SessionShared.tsx               # ScreenShell, QuestionOptionButton, etc.
│   │   │   │       ├── session.types.ts                # HostPhase, JoinPhase, WebSocket event types
│   │   │   │       ├── session.utils.ts                # normalizeQuestionRendererType, buildLeaderboard
│   │   │   │       ├── realtime.events.ts              # Event name constants + direction maps
│   │   │   │       ├── realtime.effects.ts             # useRealtimeAudio (Web Audio API)
│   │   │   │       ├── host/                           # Host screens (Lobby, Reveal, Correct, Leaderboard, Winner)
│   │   │   │       ├── join/                           # Join screens (Lobby, Waiting, Result, Final)
│   │   │   │       └── self-paced/                     # Self-paced screens (Entry, Quiz, Confirm, Result)
│   │   │   └── utils/                                  # (if present)
│   │   ├── content/                       # Content domain (banks, questions, topics)
│   │   │   ├── api/content.api.ts         # All content API functions
│   │   │   ├── components/
│   │   │   │   ├── bank/                  # Bank catalog, detail, edit, new
│   │   │   │   ├── question/              # Question catalog, detail, edit, new
│   │   │   │   ├── question-common/       # Shared rubric components
│   │   │   │   ├── question-form/         # Shared form components
│   │   │   │   └── topic/                 # TopicsManager
│   │   │   └── utils/
│   │   │       ├── question-ai-grading.ts # AI grading mode inference + form sync
│   │   │       ├── question-duplicate-id.ts
│   │   │       ├── topic-storage.ts
│   │   │       └── topic-utils.ts         # ALL_TOPICS_VALUE, assessmentMatchesTopic, etc.
│   │   ├── dashboard/                     # Dashboard domain
│   │   │   ├── api/dashboard.api.ts       # getDashboardOverviewSections, getDashboardAnalytics
│   │   │   └── components/                # DashboardPageView, QuickLaunchpad, RecentAssessmentTable
│   │   ├── analytics/                     # Analytics domain
│   │   │   ├── components/                # AnalyticsPageView, DistributionCard, QuestionBreakdown
│   │   │   └── utils/analytics.utils.ts
│   │   ├── search/components/             # SearchPageView
│   │   └── ui/                            # Shared UI components
│   │       ├── data/PaginatedCollectionCard.tsx
│   │       ├── feedback/StateMessage.tsx   # Empty/error state with optional actions
│   │       ├── layout/                    # Sidebar, Topbar, WorkspaceShell, PageHeaderCard, PageSkeletons
│   │       ├── navigation/                # BackButton, Pagination, LinkPagination
│   │       └── ui/                        # badge, card, locale-switch, skeleton, table
│   ├── hooks/
│   │   ├── use-global-topic-filter.ts     # URL-synced topic filter with localStorage persistence
│   │   └── use-url-query-state.ts         # URL query updater, debounced search param, int parser
│   ├── lib/
│   │   └── api-client.ts                 # OAuth2 Client Credentials → Bearer token → fetch wrapper
│   ├── schemas/                           # Zod validation schemas (17 files)
│   │   ├── base.schema.ts                 # uuidSchema, timestampSchema
│   │   ├── assessment.schema.ts
│   │   ├── assessment-form.schema.ts
│   │   ├── question.schema.ts
│   │   ├── question-form.schema.ts
│   │   ├── question-settings.schema.ts
│   │   ├── question-bank-form.schema.ts
│   │   ├── question-correct-answer.schema.ts   # z.discriminatedUnion on "type"
│   │   ├── question-type.schema.ts
│   │   ├── answer-option.schema.ts
│   │   ├── answer-entry.schema.ts
│   │   ├── answer-entry-response.schema.ts
│   │   ├── answer-sheet.schema.ts
│   │   ├── bank.schema.ts
│   │   ├── topic.schema.ts
│   │   ├── participant.schema.ts
│   │   └── snapshot.schema.ts
│   ├── stores/                            # Zustand stores (3)
│   │   ├── useContentStore.ts             # banks[], topics[], questions[], fetchAllContent()
│   │   ├── useAssessmentStore.ts          # assessments[], participants[], answerSheets[]
│   │   └── useDashboardStore.ts           # overviewSections, analytics
│   └── types/                             # TypeScript type definitions (25 files)
│       ├── assessment.ts, assessment-catalog.ts, assessment-detail.ts, assessment-form.ts
│       ├── question.ts, question-settings.ts, question-correct-answer.ts, question-type.ts
│       ├── bank.ts, topic.ts, participant.ts
│       ├── answer-sheet.ts, answer-entry.ts, answer-entry-response.ts
│       ├── dashboard.ts, dashboard-overview.ts, dashboard-analytics.ts
│       ├── pagination.ts, response.ts, snapshot.ts
│       └── index.ts
├── docs/                                  # Frontend documentation
│   ├── assessment-service-project-content-summary-v3.md  # Main architectural doc (544 lines)
│   ├── assessment-session-components.md                  # Session component tree
│   ├── endpoints.md                                      # Full API endpoint catalog
│   ├── ERD.md                                            # DBML entity-relationship diagram
│   ├── project-structure.md                              # Historical structure reference
│   └── realtime-websocket-events.md                      # WebSocket event contract
├── public/                                # Static assets
├── next.config.ts                         # Next.js 16 config
├── package.json                           # pnpm@10.33.0
└── Dockerfile
```

---

## Architecture Patterns

### Domain-Based Component Organization

Every domain follows this internal structure:

```
src/components/<domain>/
├── api/<domain>.api.ts      # API functions — use "use cache" directive, call apiClient
├── components/              # Page sections, feature components
│   ├── <domain>-catalog/    # List/catalog views
│   ├── <domain>-detail/     # Detail views
│   ├── <domain>-new/        # Create forms/wizards
│   └── ...                  # Feature-specific subdirectories
└── utils/                   # Domain-specific utilities
```

### Pages are Async Server Components

```typescript
// src/app/(workspace)/assessments/page.tsx
export default async function Page({ searchParams }) {
  const data = await getAssessmentsCatalog({ ...searchParams });
  return <AssessmentsCatalog data={data} />;
}
```

- Data fetching happens in the page (Server Component)
- Data functions are co-located in the domain `api/` directory
- Use `"use cache"` on data functions for Next.js 16 caching
- Use `<Suspense>` with skeleton `loading.tsx` for streaming

### Interactive Components are Client Components

- Tables with sorting/filtering: `"use client"` with local state
- Forms: `"use client"` with controlled inputs
- Session screens: `"use client"` with `useState` for phase management

---

## API Client (`src/lib/api-client.ts`)

OAuth2 Client Credentials flow, fully automatic:

```typescript
import { apiClient } from "@/lib/api-client";

// GET
const data = await apiClient.get<ResponseType>("/assessments?topic=123");

// POST
const result = await apiClient.post<ResponseType>("/assessments", body);

// PATCH
await apiClient.patch<ResponseType>("/assessments/456", body);

// DELETE
await apiClient.delete("/assessments/456");
```

**How it works:**

1. First API call → `authenticate()`: POSTs `clientId` + `clientSecret` to `/auth/token`
2. Caches `access_token` in memory with 10-second expiry buffer
3. All subsequent calls inject `Authorization: Bearer <token>` header
4. Token refresh is automatic on expiry

**Environment variables** (`.env.local`):

- `API_URL=http://localhost:3001`
- `API_CLIENT_ID=<uuid>`
- `API_CLIENT_SECRET=<secret>`

---

## State Management

### Zustand Stores (server data)

- `useContentStore` — banks, topics, questions (with `fetchAllContent()`)
- `useAssessmentStore` — assessments, participants, answerSheets
- `useDashboardStore` — overview sections, analytics

All stores follow the same pattern: `data[]`, `isLoading`, `error`, `fetch*()` actions.

### URL Query State (UI filters)

- `useGlobalTopicFilter()` — reads/writes `?topic=` query param, persists to `localStorage`
- `useUrlQueryUpdater()` — generic URL query param updater
- `useDebouncedSearchParam()` — debounced search input (300ms default, key: "query")

### Local State (session screens)

Session flows (take, host, join, preview) use local `useState` for phase/step management. They do NOT use Zustand. The docs reference future Zustand + `persist` middleware for self-paced state recovery.

---

## Question Renderer System

The dispatcher pattern maps question types to renderer components:

```
QuestionRenderer.tsx (dispatcher)
  ├── SingleChoiceRenderer     → SINGLE_CHOICE
  ├── MultipleChoiceRenderer    → MULTIPLE_CHOICE
  ├── BooleanRenderer           → TRUE_FALSE
  ├── OrderingRenderer          → ORDERING
  ├── FillInTheBlankRenderer    → FILL_IN_THE_BLANK
  ├── MatchingRenderer          → MATCHING
  ├── RatingRenderer            → RATING
  ├── ShortAnswerRenderer       → SHORT_ANSWER
  ├── EssayRenderer             → ESSAY
  └── FileUploadRenderer        → FILE_UPLOAD
```

**Props interface** (`types.ts`):

```typescript
interface QuestionRendererProps {
  question: Question;
  value: QuestionRendererValue | undefined;
  onChange: (value: QuestionRendererValue) => void;
  disabled?: boolean;
  showCorrectAnswer?: boolean;
  correctAnswer?: CorrectAnswer;
}
```

**Type normalization:** `normalizeQuestionRendererType()` handles case/format variations from the API before dispatching.

---

## Session Screen Patterns

### Self-Paced Flow (`AssessmentTakeScreen`)

Phases: `entry` → `quiz` → `confirm` → `result`

- Entry: identity form + timer display
- Quiz: progress bar, question nav, prev/next
- Confirm: review all answers before submit
- Result: score, grade, answer sheet

### Real-Time Host Flow (`AssessmentHostScreen`)

Phases: `lobby` → `reveal` → `correct` → `leaderboard` → `winner`

- Lobby: QR code, participant roster, start button
- Reveal: live timer, response count
- Correct: bar chart distribution, correct answer highlight
- Leaderboard: animated ranking, streaks
- Winner: podium (top 3)

### Real-Time Join Flow (`AssessmentJoinScreen`)

Phases: `lobby` → `waiting` → `pick_option` → `result` → `final`

- Lobby: display name form
- Waiting: "Waiting for host..."
- Result: correct/wrong, points earned
- Final: final score and rank

### Preview Screens

`AssessmentPreviewScreen` handles both `SELF_PACED` and `REAL_TIME` modes for creators to preview the participant experience before publishing.

---

## Form Patterns

### Multi-Step Wizard (`AssessmentNewWizard`)

- Step 1: `AssessmentBasicInfoStep` — title, description, type, delivery mode
- Step 2: `AssessmentSettingsStep` — time limit, pass mark, grade labels, participant identity
- State managed in the wizard component, passed down to steps as props
- Reused for edit mode (pre-populated from existing data)

### Question Forms

- `QuestionNewForm` / `QuestionEditForm` — text, type selector, options, correct answer, rubric
- `QuestionDetailsCard`, `QuestionTypeSettingsCard`, `QuestionPreviewCard` — shared across new/edit
- `QuestionRubricCard`, `QuestionRubricField`, `QuestionRubricSettings` — AI grading rubric config
- Type-specific correct answer schemas: `z.discriminatedUnion("type", [...])` in `question-correct-answer.schema.ts`

---

## Real-Time UI (WebSocket)

### Event Contract

See `docs/realtime-websocket-events.md` for the strict event contract.

**Client → Server:**

- `JOIN_ROOM` — `{ roomId, role, participantId? }`
- `START_Q` — host advances to next question
- `SUBMIT_ANS` — `{ choice?, response?, timeTaken }`
- `REVEAL_ANSWERS` — host forces answer reveal

**Server → Client:**

- `ROOM_UPDATE` — `{ count, participants }`
- `NEW_QUESTION` — `{ q: {id, text, type}, options, endTime }`
- `Q_RESULTS` — `{ correct, stats: [{optionId, count}] }`
- `SHOW_RANK` — `{ top5, myRank }`
- `SHOW_FINAL_RANK` — `{ id, name, score, rank }` (top 3)

### Event Constants

All event names are defined in `realtime.events.ts` with direction maps. Import constants, never hardcode event strings.

### Audio Effects

`useRealtimeAudio` hook in `realtime.effects.ts` — Web Audio API tones for countdown, correct/wrong answers, leaderboard reveals.

### Current State

Session screens use **mock data** (demo participant roster, mock leaderboard) for UI development. Socket.IO integration is planned but not yet connected.

---

## Next.js 16 Specifics

### Config (`next.config.ts`)

```typescript
const nextConfig: NextConfig = {
  cacheComponents: true,
  experimental: {
    staleTimes: {
      dynamic: 120, // 2 min stale time
      static: 300, // 5 min stale time
    },
    turbopackFileSystemCacheForDev: true,
  },
};
```

### `"use cache"` Directive

Data functions use the `"use cache"` directive for persistent caching:

```typescript
// src/components/assessment/api/assessment.api.ts
export async function getAssessmentsCatalog(params: QueryParams) {
  "use cache";
  const response = await apiClient.get<PaginatedResponse>("/assessments", {
    params,
  });
  return response.data;
}
```

### Route Groups

- `(workspace)` — no URL segment, wraps pages in `WorkspaceShell` layout
- `(fullscreen)` — no URL segment, no shared shell, full-screen pages

### Loading States

- `loading.tsx` files provide Suspense boundaries automatically
- `PageSkeletons.tsx` provides `WorkspacePageSkeleton`, `AnalyticsContentSkeleton`, `TopbarSkeleton`

---

## Zod Schemas

All validation schemas in `src/schemas/`. Key patterns:

```typescript
// Discriminated union for correct answers
const correctAnswerSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("SINGLE_CHOICE"), optionId: uuidSchema }),
  z.object({
    type: z.literal("MULTIPLE_CHOICE"),
    optionIds: z.array(uuidSchema),
  }),
  // ... etc for all types
]);
```

Schemas mirror the TypeScript types in `src/types/`. Always update both.

---

## Common Pitfalls

1. **`"use client"` vs Server Components** — Forms, interactive tables, session screens need `"use client"`. Pages and layouts are Server Components by default.
2. **API Client import** — Always import from `@/lib/api-client`, never use raw `fetch`.
3. **Route group layouts** — `(workspace)` pages automatically get the sidebar+topbar shell. `(fullscreen)` pages don't.
4. **Topic filter** — The workspace uses a global topic filter (`?topic=`) that affects all catalog views. Use `ALL_TOPICS_VALUE` constant for "all topics".
5. **Question type names** — API uses uppercase (`SINGLE_CHOICE`), renderers normalize via `normalizeQuestionRendererType()`.
6. **Session state** — Session flows use local `useState`, not Zustand. Keep phase transitions synchronous.
7. **Fonts** — Only DM Serif Display, DM Sans, and Koh Santepheap are configured. Don't add new fonts without updating the root layout.
8. **Tailwind v4** — Uses the new Tailwind CSS 4 syntax. Check the Tailwind docs if you encounter unfamiliar patterns.
9. **No pages/ directory** — Everything is App Router. Page conventions follow Next.js 16, not traditional Next.js.

---

## Scripts Quick Reference

| Command      | Purpose                |
| ------------ | ---------------------- |
| `pnpm dev`   | Dev server (Turbopack) |
| `pnpm build` | Production build       |
| `pnpm start` | Run production build   |
| `pnpm lint`  | ESLint                 |

---

## References

- **Main architectural doc:** `docs/assessment-service-project-content-summary-v3.md`
- **API endpoints:** `docs/endpoints.md`
- **ERD:** `docs/ERD.md`
- **WebSocket events:** `docs/realtime-websocket-events.md`
- **Session components:** `docs/assessment-session-components.md`
- **Backend system docs:** `../assessment-service-backend/system.md`
- **Next.js 16 docs:** `node_modules/next/dist/docs/`
