import type { AssessmentCatalogItem } from "@/src/types/assessment-catalog.types";
import type { AnswerEntry } from "@/src/types/answer-entry.types";
import type { AnswerSheet } from "@/src/types/answer-sheet.types";
import type { AssessmentTopicMap, Topic } from "@/src/types";

export interface AnalyticsPageViewProps {
  assessments: AssessmentCatalogItem[];
  assessmentTopics: AssessmentTopicMap[];
  topics: Topic[];
  answerEntries: AnswerEntry[];
  answerSheets: AnswerSheet[];
}

export interface AnalyticsDistributionItem {
  id: string;
  label: string;
  value: number;
  helper: string;
  toneClassName: string;
}

export interface AnalyticsAssessmentRow {
  id: string;
  title: string;
  topicLabels: string[];
  participants: number;
  questions: number;
  averageScore: number | null;
  passRate: number | null;
  lifecycle: AssessmentCatalogItem["lifecycle"];
  deliveryMode: AssessmentCatalogItem["delivery_mode"];
}

export interface AnalyticsSnapshot {
  questionTypeDistribution: AnalyticsDistributionItem[];
  difficultyDistribution: AnalyticsDistributionItem[];
  questionBreakdown: AnalyticsQuestionBreakdown[];
  assessmentRows: AnalyticsAssessmentRow[];
  selectedTopicLabel: string;
}

export interface AnalyticsQuestionOptionStat {
  id: string;
  label: string;
  picks: number;
  isCorrect: boolean;
}

export interface AnalyticsQuestionBreakdown {
  id: string;
  assessmentId: string;
  assessmentTitle: string;
  questionText: string;
  questionType: string;
  responseCount: number;
  correctResponseCount: number;
  optionStats: AnalyticsQuestionOptionStat[];
}
