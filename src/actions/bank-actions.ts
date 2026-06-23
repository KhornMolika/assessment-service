"use server";

import { fetchWithAuth } from "./fetch-utils";
import { Question } from "./question-actions";
import { QuestionBank } from "@/src/types/api";

export type CreateBankPayload = {
  name: string;
  description?: string;
  tags?: string[];
  visibility: "PUBLIC" | "PRIVATE";
};

export type UpdateBankPayload = {
  name?: string;
  visibility?: "PUBLIC" | "PRIVATE";
};

export async function createQuestionBank(
  topicId: string,
  payload: CreateBankPayload,
): Promise<QuestionBank> {
  const data = await fetchWithAuth(`/topics/${topicId}/banks`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data || data;
}

export async function updateQuestionBank(
  id: string,
  payload: UpdateBankPayload,
): Promise<QuestionBank> {
  const data = await fetchWithAuth(`/banks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return data.data || data;
}

export async function deleteQuestionBank(id: string): Promise<void> {
  await fetchWithAuth(`/banks/${id}`, {
    method: "DELETE",
  });
}

export async function fetchTopicBanks(
  topicId: string,
): Promise<QuestionBank[]> {
  const data = await fetchWithAuth(`/topics/${topicId}/banks`);
  return Array.isArray(data.data) ? data.data : data;
}

export async function fetchGlobalBanks(): Promise<QuestionBank[]> {
  const data = await fetchWithAuth(`/banks`);
  return Array.isArray(data.data) ? data.data : data;
}

export async function fetchBankQuestions(bankId: string): Promise<Question[]> {
  const data = await fetchWithAuth(
    `/banks/${bankId}/questions?page=1&limit=500`,
  );
  return Array.isArray(data.data) ? data.data : data;
}

export async function addQuestionsToBank(
  bankId: string,
  questionIds: string[],
): Promise<void> {
  await fetchWithAuth(`/banks/${bankId}/questions`, {
    method: "POST",
    body: JSON.stringify({ questionIds }),
  });
}

export async function removeQuestionFromBank(
  bankId: string,
  questionId: string,
): Promise<void> {
  await fetchWithAuth(`/banks/${bankId}/questions/${questionId}`, {
    method: "DELETE",
  });
}
