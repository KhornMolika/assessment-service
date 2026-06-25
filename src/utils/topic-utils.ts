import type {
  AssessmentTopicMap,
  BankTopicMap,
  QuestionTopicMap,
  Topic,
} from "@/src/types";

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
      mapping.questionBankId === bankId && mapping.topicId === topicId,
  );
}

export function questionMatchesTopic(
  questionId: string,
  topicId: string,
  questionTopics: QuestionTopicMap[],
) {
  return questionTopics.some(
    (mapping) => mapping.questionId === questionId && mapping.topicId === topicId,
  );
}

export function assessmentMatchesTopic(
  assessmentId: string,
  topicId: string,
  assessmentTopics: AssessmentTopicMap[],
) {
  return assessmentTopics.some(
    (mapping) =>
      mapping.assessmentId === assessmentId && mapping.topicId === topicId,
  );
}
