import { apiClient } from "../api-client";
import type { PaginatedResponse, QuestionBank, Question } from "@/src/types/api";

export async function getBanks(page = 1, limit = 10) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  return apiClient.get<PaginatedResponse<QuestionBank>>(`/banks?${queryParams}`);
}

export async function getBankById(id: string) {
  return apiClient.get<QuestionBank>(`/banks/${id}`);
}

export async function getTopicBanks(topicId: string, page = 1, limit = 10) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  return apiClient.get<PaginatedResponse<QuestionBank>>(`/topics/${topicId}/banks?${queryParams}`);
}

export async function createBank(topicId: string, data: Partial<QuestionBank>) {
  return apiClient.post<QuestionBank>(`/topics/${topicId}/banks`, data);
}

export async function updateBank(id: string, data: Partial<QuestionBank>) {
  return apiClient.patch<QuestionBank>(`/banks/${id}`, data);
}

export async function deleteBank(id: string) {
  return apiClient.delete<void>(`/banks/${id}`);
}

export async function getBankQuestions(id: string, page = 1, limit = 10) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  return apiClient.get<PaginatedResponse<Question>>(`/banks/${id}/questions?${queryParams}`);
}

export async function addQuestionsToBank(id: string, data: { questionIds: string[] }) {
  return apiClient.post<void>(`/banks/${id}/questions`, data);
}

export async function removeQuestionFromBank(id: string, questionId: string) {
  return apiClient.delete<void>(`/banks/${id}/questions/${questionId}`);
}
