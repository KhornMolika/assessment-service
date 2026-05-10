import type { AnswerEntry } from "./answer-entry.types";
import type { AnswerSheet } from "./answer-sheet.types";
import type { AssessmentCatalogItem } from "./assessment-catalog.types";
import type { Participant } from "./participant.types";
import type { AssessmentTopicMap, Topic } from "@/src/domains/content/types";

export interface AssessmentResultsStats {
  totalSubmissions: number;
  averageScorePercent: number;
  passRatePercent: number;
  totalParticipants: number;
}

export interface ResultQuestionEntity {
  id: string;
  question_text: string;
  type_id: string;
  points: number;
}

export interface AssessmentResultsPageData {
  stats: AssessmentResultsStats;
  assessments: AssessmentCatalogItem[];
  participants: Participant[];
  answer_sheets: AnswerSheet[];
  answer_entries: AnswerEntry[];
  questions: ResultQuestionEntity[];
  topics: Topic[];
  assessment_topics: AssessmentTopicMap[];
}

export interface AssessmentResultSheetPageData {
  assessment: AssessmentCatalogItem;
  participant: Participant;
  answer_sheet: AnswerSheet;
  questions: ResultQuestionEntity[];
  answer_entries: AnswerEntry[];
}

export interface AssessmentScopedResultsPageData {
  assessment: AssessmentCatalogItem;
  stats: AssessmentResultsStats & {
    pendingReviewCount: number;
  };
  participants: Participant[];
  answer_sheets: AnswerSheet[];
  answer_entries: AnswerEntry[];
  questions: ResultQuestionEntity[];
}
