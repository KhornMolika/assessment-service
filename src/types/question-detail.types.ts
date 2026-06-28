export interface QuestionTopic {
  id: string;
  name: string;
}

export interface QuestionTypeMeta {
  id: string;
  name: string;
  gradingStrategy: string;
  hasOptions: boolean;
  supportsAi: boolean;
  isManualOnly: boolean;
  defaultMaxScore: number;
  description: string;
}

export interface QuestionAnswerOptionDetail {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  optionOrder: number;
}

export interface QuestionAiGradingConfig {
  mode: string;
  maxScore: number;
  instruction: string;
}

export interface QuestionPerformanceStats {
  createdBy: string;
  usedInAssessments: number;
  totalAttempts: number;
  averageScore: number;
  correctAnswers: number;
}

export interface QuestionDetailData {
  id: string;
  bankId: string | null;
  typeId: string;
  questionText: string;
  language: "EN" | "KH";
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  tags: string[];
  settings: Record<string, boolean | number | string>;
  correctAnswers: Record<string, unknown>;
  createdAt: string;
  bank: {
    id: string;
    name: string;
    ownerId: string;
  } | null;
  type: QuestionTypeMeta;
  topics: QuestionTopic[];
  answerOptions: QuestionAnswerOptionDetail[];
  aiGradingConfig: QuestionAiGradingConfig | null;
  stats: QuestionPerformanceStats;
}

export interface ApiQuestionResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  topic?: {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    name?: string;
    slug?: string;
    description?: string;
  };
  bankId?: string;
  type: string;
  difficulty: string;
  points: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any;
  questionText: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  correctAnswers: any;
  topicId: string | null;
}
