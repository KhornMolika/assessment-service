import type {
  AssessmentTopicMap,
  BankTopicMap,
  QuestionTopicMap,
  Topic,
} from "@/src/domains/content/types";

export const ALL_TOPICS_VALUE = "all-topics";

export function getTopicOptions({
  topics,
  ..._unusedMappings
}: {
  topics: Topic[];
  bankTopics: BankTopicMap[];
  questionTopics: QuestionTopicMap[];
  assessmentTopics: AssessmentTopicMap[];
}) {
  void _unusedMappings;
  return [...topics].sort((left, right) => left.name.localeCompare(right.name));
}

export function bankMatchesTopic(
  bankId: string,
  topicId: string,
  bankTopics: BankTopicMap[],
) {
  return bankTopics.some(
    (mapping) =>
      mapping.question_bank_id === bankId && mapping.topic_id === topicId,
  );
}

export function questionMatchesTopic(
  questionId: string,
  topicId: string,
  questionTopics: QuestionTopicMap[],
) {
  return questionTopics.some(
    (mapping) => mapping.question_id === questionId && mapping.topic_id === topicId,
  );
}

export function assessmentMatchesTopic(
  assessmentId: string,
  topicId: string,
  assessmentTopics: AssessmentTopicMap[],
) {
  return assessmentTopics.some(
    (mapping) =>
      mapping.assessment_id === assessmentId && mapping.topic_id === topicId,
  );
}
