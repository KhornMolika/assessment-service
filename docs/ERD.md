notation crows-foot
title Assessment Service Schema

clients [icon: user, color: blue] {
  id uuid pk
  createdAt timestamp
  updatedAt timestamp
  deletedAt timestamp
  name varchar
  slug varchar
  clientId uuid
  clientSecretHash varchar
  isActive boolean
  allowedOrigins text[]
  scopes text[]
  webhookUrl varchar
  webhookSecret varchar
}
participants [icon: users, color: green] {
  id uuid pk
  clientId uuid fk
  createdAt timestamp
  updatedAt timestamp
  deletedAt timestamp
  name varchar
  email varchar
  phone varchar
}
topics [icon: folder, color: purple] {
  id uuid pk
  clientId uuid fk
  createdAt timestamp
  updatedAt timestamp
  deletedAt timestamp
  name varchar
  slug varchar
  description text
}
question_banks [icon: database, color: orange] {
  id uuid pk
  clientId uuid fk
  createdAt timestamp
  updatedAt timestamp
  deletedAt timestamp
  topicId uuid fk
  name varchar
  visibility enum
  description text
  tags text[]
}
questions [icon: help-circle, color: orange] {
  id uuid pk
  clientId uuid fk
  createdAt timestamp
  updatedAt timestamp
  deletedAt timestamp
  topicId uuid fk
  type enum
  questionText text
  difficulty enum
  points number
  options jsonb
  correctAnswer jsonb
}
question_bank_questions [icon: link, color: orange] {
  id uuid pk
  clientId uuid fk
  createdAt timestamp
  updatedAt timestamp
  deletedAt timestamp
  questionBankId uuid fk
  questionId uuid fk
  order number
}
assessments [icon: file-text, color: red] {
  id uuid pk
  clientId uuid fk
  createdAt timestamp
  updatedAt timestamp
  deletedAt timestamp
  topicId uuid fk
  name varchar
  type enum
  description text
  status enum
}
assessment_settings [icon: settings, color: red] {
  id uuid pk
  clientId uuid fk
  createdAt timestamp
  updatedAt timestamp
  deletedAt timestamp
  assessmentId uuid fk
  mode enum
  questionSelection enum
  participantIdentity enum
  numQuestions int
  selectionRules jsonb
  timeLimit int
  startsAt timestamp
  endsAt timestamp
  passMark int
  isShuffle boolean
  showResults enum
  gradeLabels jsonb
  isAllowShare boolean
  allowReview boolean
  manualGradingAIQues boolean
}
assessment_questions [icon: list, color: red] {
  id uuid pk
  clientId uuid fk
  createdAt timestamp
  updatedAt timestamp
  deletedAt timestamp
  assessmentId uuid fk
  questionId uuid fk
  order int
  points decimal
  questionType enum
  questionSnapshot jsonb
}
assessment_participants [icon: user-check, color: green] {
  id uuid pk
  clientId uuid fk
  createdAt timestamp
  updatedAt timestamp
  deletedAt timestamp
  assessmentId uuid fk
  participantId uuid fk
  status enum
  assignedAt timestamp
}
answer_sheets [icon: check-square, color: blue] {
  id uuid pk
  clientId uuid fk
  createdAt timestamp
  updatedAt timestamp
  deletedAt timestamp
  assessmentParticipantId uuid fk
  assessmentId uuid fk
  status enum
  totalScore number
  grade varchar
  isPassed boolean
  startedAt timestamp
  submittedAt timestamp
  selectedQuestionIds jsonb
}
answer_entries [icon: edit-2, color: blue] {
  id uuid pk
  clientId uuid fk
  createdAt timestamp
  updatedAt timestamp
  deletedAt timestamp
  answerSheetId uuid fk
  assessmentQuestionId uuid fk
  response jsonb
  scoreAwarded decimal
  maxScore decimal
  gradingStatus enum
}
ai_grading_jobs [icon: bot, color: pink] {
  id uuid pk
  clientId uuid fk
  createdAt timestamp
  updatedAt timestamp
  deletedAt timestamp
  answerEntryId uuid fk
  status enum
  suggestedScore decimal
  reasoning text
  failureReason text
  attemptCount int
  processedAt timestamp
}
// Relationships
clients.id < participants.clientId
clients.id < topics.clientId
clients.id < question_banks.clientId
clients.id < questions.clientId
clients.id < question_bank_questions.clientId
clients.id < assessments.clientId
clients.id < assessment_settings.clientId
clients.id < assessment_questions.clientId
clients.id < assessment_participants.clientId
clients.id < answer_sheets.clientId
clients.id < answer_entries.clientId
clients.id < ai_grading_jobs.clientId
topics.id < question_banks.topicId
topics.id < questions.topicId
topics.id < assessments.topicId
question_banks.id < question_bank_questions.questionBankId
questions.id < question_bank_questions.questionId
assessments.id - assessment_settings.assessmentId
assessments.id < assessment_questions.assessmentId
questions.id < assessment_questions.questionId
assessments.id < assessment_participants.assessmentId
participants.id < assessment_participants.participantId
assessment_participants.id - answer_sheets.assessmentParticipantId
assessments.id < answer_sheets.assessmentId
answer_sheets.id < answer_entries.answerSheetId
assessment_questions.id < answer_entries.assessmentQuestionId
answer_entries.id < ai_grading_jobs.answerEntryId