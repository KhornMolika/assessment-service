# Assessment Service Endpoints and Data Views

This document lists the API endpoints needed when replacing mock data with a real backend, then separately lists database views and indexes that should support fast catalog filtering, global search, dashboard metrics, and reports.

## API Endpoints

### Core Reference Data

```http
GET /topics
GET /topics/:id
POST /topics
PATCH /topics/:id
DELETE /topics/:id
```

### Question Banks

```http
GET /banks?topicId=&visibility=&q=
GET /banks/:bankId
POST /banks
PATCH /banks/:bankId
DELETE /banks/:bankId
POST /banks/:bankId/duplicate
GET /banks/:bankId/questions
PUT /banks/:bankId/topics
```

### Questions

```http
GET /questions?topicId=&bankId=&type=&difficulty=&q=
GET /questions/:questionId
POST /questions
PATCH /questions/:questionId
DELETE /questions/:questionId
POST /questions/:questionId/duplicate
GET /question-types
PUT /questions/:questionId/topics
```

### Assessments

```http
GET /assessments?topicId=&deliveryMode=&status=&lifecycle=&q=
GET /assessments/:assessmentId
POST /assessments
PATCH /assessments/:assessmentId
DELETE /assessments/:assessmentId
POST /assessments/:assessmentId/duplicate
POST /assessments/:assessmentId/publish
POST /assessments/:assessmentId/archive
PUT /assessments/:assessmentId/topics
GET /assessments/:assessmentId/questions
```

### Assessment Builder Support

```http
GET /assessments/new-data
GET /assessments/:assessmentId/edit-data
```

`/assessments/new-data` should return banks, questions, and topics for the create wizard.

`/assessments/:assessmentId/edit-data` should return assessment form data, banks, questions, and topics for the edit wizard.

### Self-Paced Player

```http
GET /assessments/:assessmentId/take
POST /assessments/:assessmentId/sessions
PATCH /answer-sheets/:sheetId/answers
POST /answer-sheets/:sheetId/submit
GET /answer-sheets/:sheetId/result
```

`GET /assessments/:assessmentId/take` should return the assessment, questions, renderer settings, and participant rules.

`POST /assessments/:assessmentId/sessions` creates a participant answer session.

`PATCH /answer-sheets/:sheetId/answers` supports autosave or explicit answer save.

### Results and Reports

```http
GET /results?topicId=&assessmentId=&status=&q=
GET /results/:sheetId
GET /assessments/:assessmentId/reports
PATCH /answer-entries/:entryId/grade
POST /answer-sheets/:sheetId/regrade
GET /results/export.csv
GET /assessments/:assessmentId/reports/export.csv
```

### Analytics and Dashboard

```http
GET /dashboard/overview?topicId=
GET /dashboard/analytics?topicId=
GET /analytics?topicId=&dateFrom=&dateTo=
```

### Search

```http
GET /search?q=&topicId=
```

This endpoint should return matching assessments, question banks, and questions.

### File Uploads

```http
POST /files/presign-upload
POST /files/complete-upload
GET /files/:fileId
```

### Real-Time Mode

HTTP setup endpoints:

```http
POST /assessments/:assessmentId/live-sessions
GET /live-sessions/:sessionId
POST /live-sessions/:sessionId/start
POST /live-sessions/:sessionId/questions/:questionId/start
POST /live-sessions/:sessionId/questions/:questionId/end
POST /live-sessions/:sessionId/next
POST /live-sessions/:sessionId/end
GET /live-sessions/:sessionId/rankings
```

Socket events mapped by the UI:

```text
JOIN_ROOM
ROOM_UPDATE
START_Q
NEW_QUESTION
SUBMIT_ANS
Q_RESULTS
SHOW_RANK
SHOW_FINAL_RANK
```

### Minimum Mock Replacement Set

The smallest backend surface that unblocks replacing the current mock data is:

- topics
- banks
- questions
- assessments
- assessment detail/questions
- results/report data
- self-paced submit flow
- real-time socket gateway

## Table Views and Indexing

Use normal entity endpoints for create, update, delete, and detail pages. Use indexed table views for catalog pages, global search, dashboard cards, analytics, reports, and all topic-filtered pages.

### Recommended Views

```sql
assessment_catalog_view
question_catalog_view
bank_catalog_view
result_sheet_view
assessment_report_summary_view
dashboard_topic_summary_view
```

### Where Views Should Be Used

`assessment_catalog_view`

- Used by `/assessments`
- Supports `topicId`, `deliveryMode`, `status`, `lifecycle`, and `text search`.

`question_catalog_view`

- Used by `/questions`
- Supports `topicId`, `bankId`, `type`, `difficulty`, and text search.

`bank_catalog_view`

- Used by `/banks`
- Supports `topicId`, `visibility`, and text search.

`result_sheet_view`

- Used by `/results`
- Supports `topicId`, `assessmentId`, review status, participant search, and submitted date sorting.

`assessment_report_summary_view`

- Used by `/assessments/:assessmentId/reports`
- Supports assessment-level report cards, participant rows, score distribution, pass rate, and pending review counts.

`dashboard_topic_summary_view`

- Used by `/`, `/analytics`, and dashboard endpoints
- Supports topic-filtered counts and aggregate metrics across assessments, banks, questions, participants, answer sheets, and answer entries.

### Recommended Indexes

Topic mapping indexes:

```sql
CREATE INDEX idx_assessment_topics_topic
ON assessment_topics(topic_id, assessment_id);

CREATE INDEX idx_bank_topics_topic
ON bank_topics(topic_id, question_bank_id);

CREATE INDEX idx_question_topics_topic
ON question_topics(topic_id, question_id);
```

Catalog filter indexes:

```sql
CREATE INDEX idx_assessments_catalog
ON assessments(delivery_mode, status, lifecycle, starts_at);

CREATE INDEX idx_questions_catalog
ON questions(bank_id, type_id, difficulty, language);

CREATE INDEX idx_banks_catalog
ON question_banks(visibility, created_at);
```

Results and report indexes:

```sql
CREATE INDEX idx_answer_sheets_assessment
ON answer_sheets(assessment_id, status, submitted_at);

CREATE INDEX idx_answer_sheets_participant
ON answer_sheets(participant_id);

CREATE INDEX idx_answer_entries_sheet
ON answer_entries(sheet_id, question_id, grading_status);
```

Search indexes for PostgreSQL:

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_assessments_title_trgm
ON assessments USING gin (title gin_trgm_ops);

CREATE INDEX idx_questions_text_trgm
ON questions USING gin (question_text gin_trgm_ops);

CREATE INDEX idx_banks_name_trgm
ON question_banks USING gin (name gin_trgm_ops);
```

### Implementation Priority

Start with these because they directly affect the most common UI paths:

1. `assessment_catalog_view`
2. `question_catalog_view`
3. `bank_catalog_view`
4. `result_sheet_view`
5. topic mapping indexes
6. trigram search indexes
