export interface Topic {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export interface AssessmentTopicMap {
  assessment_id: string;
  topic_id: string;
}

export interface QuestionTopicMap {
  question_id: string;
  topic_id: string;
}

export interface BankTopicMap {
  question_bank_id: string;
  topic_id: string;
}
