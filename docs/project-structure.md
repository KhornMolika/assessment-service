# Project Structure

This document reflects the current `src/` structure.

## Route Groups

```text
src/app/
|-- page.tsx
|-- layout.tsx
|-- loading.tsx
|-- error.tsx
|-- global-error.tsx
|-- not-found.tsx
|-- analytics/
|   |-- page.tsx
|   `-- loading.tsx
|-- assessments/
|   |-- page.tsx
|   |-- loading.tsx
|   |-- new/
|   |   |-- page.tsx
|   |   `-- loading.tsx
|   `-- [id]/
|       |-- page.tsx
|       |-- edit/page.tsx
|       |-- host/page.tsx
|       |-- join/page.tsx
|       |-- real-time-preview/page.tsx
|       |-- results/page.tsx
|       |-- self-paced-preview/page.tsx
|       `-- take/
|           |-- page.tsx
|           `-- opengraph-image.tsx
|-- banks/
|   |-- page.tsx
|   |-- loading.tsx
|   |-- new/page.tsx
|   `-- [id]/
|       |-- page.tsx
|       `-- edit/page.tsx
|-- questions/
|   |-- page.tsx
|   |-- loading.tsx
|   |-- new/page.tsx
|   `-- [id]/
|       |-- page.tsx
|       `-- edit/page.tsx
|-- results/
|   |-- page.tsx
|   |-- loading.tsx
|   `-- [id]/page.tsx
`-- search/
    |-- page.tsx
    `-- loading.tsx
```

## Assessment Session Routes

- `/assessments/[id]/self-paced-preview`
  Creator read-only preview of the self-paced participant flow.

- `/assessments/[id]/take`
  Participant-facing self-paced flow. QR and copied self-paced links land here.

- `/assessments/[id]/real-time-preview`
  Creator preview of the real-time experience.

- `/assessments/[id]/host`
  Real-time host control view.

- `/assessments/[id]/join`
  Real-time participant join and play view.

## Domains

```text
src/domains/
|-- analytics/
|   |-- components/
|   |-- types/
|   `-- utils/
|-- assessment/
|   |-- api/
|   |-- schemas/
|   |-- types/
|   `-- components/
|       |-- assessment-catalog/
|       |-- assessment-detail/
|       |-- assessment-new/
|       |-- assessment-results/
|       |-- renderers/
|       |-- results/
|       `-- session/
|-- content/
|   |-- api/
|   |-- schemas/
|   |-- types/
|   |-- utils/
|   `-- components/
|       |-- bank/
|       |-- question/
|       |-- question-common/
|       `-- question-form/
|-- dashboard/
|   |-- api/
|   |-- components/
|   `-- types/
`-- search/
    `-- components/
```

## Content Domain

```text
src/domains/content/
|-- api/content.api.ts
|-- schemas/
|   |-- answer-option.schema.ts
|   |-- bank.schema.ts
|   |-- question.schema.ts
|   |-- question-bank-form.schema.ts
|   |-- question-correct-answer.schema.ts
|   |-- question-form.schema.ts
|   |-- question-settings.schema.ts
|   |-- question-type.schema.ts
|   `-- topic.schema.ts
|-- types/
|   |-- answer-option.types.ts
|   |-- bank.types.ts
|   |-- index.ts
|   |-- question.types.ts
|   |-- question-bank-form.types.ts
|   |-- question-catalog.types.ts
|   |-- question-correct-answer.types.ts
|   |-- question-detail.types.ts
|   |-- question-form.types.ts
|   |-- question-settings.types.ts
|   |-- question-type.types.ts
|   `-- topic.types.ts
|-- utils/
|   |-- question-ai-grading.ts
|   `-- topic-utils.ts
`-- components/
    |-- bank/
    |-- question/
    |-- question-common/
    `-- question-form/
```

The old `components/question-bank` tree has been replaced by `components/bank`.

## Assessment Domain

```text
src/domains/assessment/
|-- api/assessment.api.ts
|-- schemas/
|-- types/
`-- components/
    |-- assessment-catalog/
    |-- assessment-detail/
    |-- assessment-new/
    |-- assessment-results/
    |-- renderers/
    |-- results/
    |-- session/
    `-- AssessmentShareAction.tsx
```

### Question Renderers

```text
src/domains/assessment/components/renderers/
|-- QuestionRenderer.tsx
|-- types.ts
|-- boolean/BooleanRenderer.tsx
|-- essay/EssayRenderer.tsx
|-- file/FileUploadRenderer.tsx
|-- fill/FillInTheBlankRenderer.tsx
|-- matching/MatchingRenderer.tsx
|-- multiple/MultipleChoiceRenderer.tsx
|-- ordering/OrderingRenderer.tsx
|-- rating/RatingRenderer.tsx
|-- short/ShortAnswerRenderer.tsx
`-- single/SingleChoiceRenderer.tsx
```

### Session Components

```text
src/domains/assessment/components/session/
|-- AssessmentHostScreen.tsx
|-- AssessmentJoinScreen.tsx
|-- AssessmentPreviewScreen.tsx
|-- AssessmentSessionScreens.tsx
|-- AssessmentTakeScreen.tsx
|-- SessionShared.tsx
|-- avatar.utils.ts
|-- realtime.effects.ts
|-- realtime.events.ts
|-- session.types.ts
|-- session.utils.ts
|-- host/
|-- join/
`-- self-paced/
```

`realtime.events.ts` and `session.types.ts` hold the strict real-time event map used by the host and participant UI.

## Shared Layer

```text
src/shared/
|-- assets/
|-- components/
|   |-- data/
|   |-- feedback/
|   |-- layout/
|   |-- navigation/
|   `-- ui/
|-- context/
|   `-- sidebar-context.tsx
|-- hooks/
|   |-- use-global-topic-filter.ts
|   `-- use-url-query-state.ts
`-- schemas/
    `-- base.schema.ts
```

`use-global-topic-filter.ts` owns the workspace-wide topbar topic filter. It syncs the active topic to `?topic=<topic-id>` and local storage so list/search pages can filter content consistently across navigation.

## Removed Empty Folders

These empty folders were removed because they had no files:

- `src/config`
- `src/stores`
- `src/domains/content/hooks`
