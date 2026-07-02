"use server";

import { fetchWithAuth } from "./fetch-utils";
import { QuestionBank, Question } from "@/src/types/api";

export type CreateBankPayload = {
  name: string;
  description?: string;
  tags?: string[];
  visibility: "PUBLIC" | "PRIVATE" | "SHARED";
};

export type UpdateBankPayload = {
  name?: string;
  description?: string;
  tags?: string[];
  visibility?: "PUBLIC" | "PRIVATE" | "SHARED";
};

export async function fetchBankById(id: string): Promise<QuestionBank> {
  const data = await fetchWithAuth(`/banks/${id}`);
  return data.data || data;
}

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
  try {
    const data = await fetchWithAuth(`/topics/${topicId}/banks`);
    return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn(
      "Failed to fetch topic banks:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

export async function fetchGlobalBanks(): Promise<QuestionBank[]> {
  try {
    const data = await fetchWithAuth(`/banks?limit=500`);
    return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn(
      "Failed to fetch global banks:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

export async function fetchBankQuestions(bankId: string): Promise<Question[]> {
  try {
    const data = await fetchWithAuth(
      `/banks/${bankId}/questions?page=1&limit=500`,
    );
    return Array.isArray(data.data) ? data.data : Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn(
      "Failed to fetch bank questions:",
      error instanceof Error ? error.message : error,
    );
    return [];
  }
}

import { revalidatePath } from "next/cache";

export async function addQuestionsToBank(
  bankId: string,
  questionIds: string[],
): Promise<void> {
  await fetchWithAuth(`/banks/${bankId}/questions`, {
    method: "POST",
    body: JSON.stringify({ questionIds }),
  });
  revalidatePath(`/banks/${bankId}`);
  revalidatePath("/banks");
}

export async function removeQuestionFromBank(
  bankId: string,
  questionId: string,
): Promise<void> {
  await fetchWithAuth(`/banks/${bankId}/questions/${questionId}`, {
    method: "DELETE",
  });
  revalidatePath(`/banks/${bankId}`);
  revalidatePath("/banks");
}
