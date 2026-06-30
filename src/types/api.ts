// ---------------------------------------------------------
// Pagination & Metadata
// ---------------------------------------------------------
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ---------------------------------------------------------
// Core Entities
// ---------------------------------------------------------
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  clientId: string;
}

export enum TopicVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
}

export interface Topic extends BaseEntity {
  name: string;
  slug: string;
  description?: string;
  visibility: TopicVisibility;
}

export enum Difficulty {
  EASY = "EASY",
  MEDIUM = "MEDIUM",
  HARD = "HARD",
}

export enum QuestionType {
  SINGLE_CHOICE = "SINGLE_CHOICE",
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
  ORDERING = "ORDERING",
  FILL_IN_THE_BLANK = "FILL_IN_THE_BLANK",
  MATCHING = "MATCHING",
  RATING = "RATING",
  SHORT_ANSWER = "SHORT_ANSWER",
  ESSAY = "ESSAY",
}

export interface Question extends BaseEntity {
  topicId?: string;
  topic?: Topic;
  type: QuestionType;
  questionText: string;
  difficulty: Difficulty;
  points: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: Record<string, any> | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  correctAnswer: Record<string, any> | null;
}

export enum BankVisibility {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  SHARED = "SHARED",
}

export interface QuestionBank extends BaseEntity {
  topicId: string;
  topic?: Topic;
  name: string;
  visibility: BankVisibility;
  description?: string;
  tags: string[];
  questionCount?: number;
}

export enum AssessmentType {
  QUIZ = "QUIZ",
  EXAM = "EXAM",
  SURVEY = "SURVEY",
  PRACTICE = "PRACTICE",
}

export enum AssessmentStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  ARCHIVED = "ARCHIVED",
}

export interface Assessment extends BaseEntity {
  topicId: string;
  topic?: Topic;
  name: string;
  type: AssessmentType;
  description?: string;
  status: AssessmentStatus;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  settings?: any; // To be typed if needed
}

export interface Participant extends BaseEntity {
  name?: string;
  email?: string;
  phone?: string;
}
