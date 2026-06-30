"use server";

import {
  getAssessmentCatalogPageData,
  getAssessmentTopics,
} from "@/src/api/assessment.api";
import { getBankTopics } from "@/src/api/bank.api";
import { getQuestionTopics } from "@/src/api/question.api";
import { getBanks } from "@/src/lib/services/banks";
import { getQuestions } from "@/src/lib/services/questions";
import {
  ALL_TOPICS_VALUE,
  assessmentMatchesTopic,
  bankMatchesTopic,
  questionMatchesTopic,
} from "@/src/utils/topic-utils";

function includesQuery(value: string | null | undefined, query: string) {
  return (value ?? "").toLowerCase().includes(query);
}

export type GlobalSearchResult = {
  assessments: Array<{ id: string; name: string; description: string; mode?: string }>;
  banks: Array<{ id: string; name: string; description: string }>;
  questions: Array<{ id: string; questionText: string; type: string; bankName: string }>;
};

export async function globalSearch(
  query: string,
  selectedTopic: string = ALL_TOPICS_VALUE
): Promise<GlobalSearchResult> {
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) {
    return { assessments: [], banks: [], questions: [] };
  }

  const [
    assessmentData,
    banksRes,
    questionsRes,
    assessmentTopics,
    bankTopics,
    questionTopics,
  ] = await Promise.all([
    getAssessmentCatalogPageData(),
    getBanks(1, 100),
    getQuestions(1, 500),
    getAssessmentTopics(),
    getBankTopics(),
    getQuestionTopics(),
  ]);

  const banks = banksRes.data;
  const questions = questionsRes.data;
  const bankMap = Object.fromEntries(banks.map((bank) => [bank.id, bank]));

  const filteredAssessments = assessmentData.assessments
    .filter((assessment) => {
      if (
        selectedTopic !== ALL_TOPICS_VALUE &&
        !assessmentMatchesTopic(assessment.id, selectedTopic, assessmentTopics)
      ) {
        return false;
      }
      return (
        includesQuery(assessment.name, normalizedQuery) ||
        includesQuery(assessment.description, normalizedQuery) ||
        includesQuery(assessment.settings?.mode, normalizedQuery) ||
        includesQuery(assessment.status, normalizedQuery)
      );
    })
    .slice(0, 5) // Limit to top 5
    .map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description ?? "",
      mode: a.settings?.mode,
    }));

  const filteredBanks = banks
    .filter((bank) => {
      if (
        selectedTopic !== ALL_TOPICS_VALUE &&
        !bankMatchesTopic(bank.id, selectedTopic, bankTopics)
      ) {
        return false;
      }
      return (
        includesQuery(bank.name, normalizedQuery) ||
        includesQuery(bank.description, normalizedQuery)
      );
    })
    .slice(0, 5) // Limit to top 5
    .map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description ?? "",
    }));

  const filteredQuestions = questions
    .filter((question) => {
      if (
        selectedTopic !== ALL_TOPICS_VALUE &&
        !questionMatchesTopic(question.id, selectedTopic, questionTopics)
      ) {
        return false;
      }
      const bankName = question.topicId ? bankMap[question.topicId]?.name ?? "" : "";
      return (
        includesQuery(question.questionText, normalizedQuery) ||
        includesQuery(question.type, normalizedQuery) ||
        includesQuery(question.difficulty, normalizedQuery) ||
        includesQuery(bankName, normalizedQuery)
      );
    })
    .slice(0, 5) // Limit to top 5
    .map((q) => ({
      id: q.id,
      questionText: q.questionText,
      type: q.type,
      bankName: q.topicId ? bankMap[q.topicId]?.name ?? "" : "",
    }));

  return {
    assessments: filteredAssessments,
    banks: filteredBanks,
    questions: filteredQuestions,
  };
}
