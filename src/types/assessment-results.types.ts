import type { AnswerEntry } from "./answer-entry.types";
import type { AnswerSheet } from "./answer-sheet.types";
import type { AssessmentCatalogItem } from "./assessment-catalog.types";
import type { Participant } from "./participant.types";
import type { AssessmentTopicMap, Topic } from "@/src/types";

export interface AssessmentResultsStats {
  totalSubmissions: number;
  averageScorePercent: number;
  passRatePercent: number;
  totalParticipants: number;
}

export interface ResultQuestionEntity {
  id: string;
  questionText: string;
  typeId: string;
  points: number;
}

export interface AssessmentResultsPageData {
  stats: AssessmentResultsStats;
  assessments: AssessmentCatalogItem[];
  participants: Participant[];
  answerSheets: AnswerSheet[];
  answerEntries: AnswerEntry[];
  questions: ResultQuestionEntity[];
  topics: Topic[];
  assessmentTopics: AssessmentTopicMap[];
}

export interface AssessmentResultSheetPageData {
  assessment: AssessmentCatalogItem;
  participant: Participant;
  answerSheet: AnswerSheet;
  questions: ResultQuestionEntity[];
  answerEntries: AnswerEntry[];
}

export interface AssessmentScopedResultsPageData {
  assessment: AssessmentCatalogItem;
  stats: AssessmentResultsStats & {
    pendingReviewCount: number;
  };
  participants: Participant[];
  answerSheets: AnswerSheet[];
  answerEntries: AnswerEntry[];
  questions: ResultQuestionEntity[];
}
