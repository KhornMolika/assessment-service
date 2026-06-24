import { apiClient } from "../api-client";
import type { PaginatedResponse, Question } from "@/src/types/api";

function mapQuestion(q: any): Question {
  if (!q) return q;
  return {
    ...q,
    questionText: q.questionText || q.text,
    correctAnswer: q.correctAnswer || q.correctAnswers,
    topicId: q.bankId || q.topicId,
  };
}

export async function getQuestions(page = 1, limit = 10) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await apiClient.get<any>(`/questions?${queryParams}`);
  if (response && Array.isArray(response.data)) {
    response.data = response.data.map(mapQuestion);
  }
  return response as PaginatedResponse<Question>;
}

export async function getQuestionById(id: string) {
  const response = await apiClient.get<any>(`/questions/${id}`);
  if (response && response.data) {
    response.data = mapQuestion(response.data);
  } else if (response) {
    Object.assign(response, mapQuestion(response));
  }
  return response as Question;
}

export async function getTopicQuestions(topicId: string, page = 1, limit = 10) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  const response = await apiClient.get<any>(`/topics/${topicId}/questions?${queryParams}`);
  if (response && Array.isArray(response.data)) {
    response.data = response.data.map(mapQuestion);
  }
  return response as PaginatedResponse<Question>;
}

export async function createQuestion(topicId: string, data: Partial<Question>) {
  const payload = {
    ...data,
    text: data.questionText,
    correctAnswers: data.correctAnswer,
  };
  return apiClient.post<Question>(`/topics/${topicId}/questions`, payload);
}

export async function updateQuestion(id: string, data: Partial<Question>) {
  const payload = {
    ...data,
    text: data.questionText,
    correctAnswers: data.correctAnswer,
  };
  return apiClient.patch<Question>(`/questions/${id}`, payload);
}

export async function deleteQuestion(id: string) {
  return apiClient.delete<void>(`/questions/${id}`);
}
