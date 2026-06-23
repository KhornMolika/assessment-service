export interface QuestionTopic {
  id: string;
  name: string;
}

export interface QuestionTypeMeta {
  id: string;
  name: string;
  grading_strategy: string;
  has_options: boolean;
  supports_ai: boolean;
  is_manual_only: boolean;
  default_max_score: number;
  description: string;
}

export interface QuestionAnswerOptionDetail {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  option_order: number;
}

export interface QuestionAiGradingConfig {
  mode: string;
  max_score: number;
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
  bank_id: string | null;
  type_id: string;
  question_text: string;
  language: "EN" | "KH";
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  tags: string[];
  settings: Record<string, boolean | number | string>;
  correct_answer: Record<string, unknown>;
  created_at: string;
  bank: {
    id: string;
    name: string;
    owner_id: string;
  } | null;
  type: QuestionTypeMeta;
  topics: QuestionTopic[];
  answer_options: QuestionAnswerOptionDetail[];
  ai_grading_config: QuestionAiGradingConfig | null;
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
  options: any;
  questionText: string;
  correctAnswers: any;
  topicId: string | null;
}
