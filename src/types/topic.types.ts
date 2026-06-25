export interface Topic {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface AssessmentTopicMap {
  assessmentId: string;
  topicId: string;
}

export interface QuestionTopicMap {
  questionId: string;
  topicId: string;
}

export interface BankTopicMap {
  questionBankId: string;
  topicId: string;
}
