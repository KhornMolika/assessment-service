import { apiClient } from "../api-client";
import type { PaginatedResponse, Assessment, Question, Participant } from "@/src/types/api";

export async function getAssessments(page = 1, limit = 10) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  return apiClient.get<PaginatedResponse<Assessment>>(`/assessments?${queryParams}`);
}

export async function getTopicAssessments(topicId: string, page = 1, limit = 10) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  return apiClient.get<PaginatedResponse<Assessment>>(`/topics/${topicId}/assessments?${queryParams}`);
}

export async function getAssessmentById(id: string) {
  return apiClient.get<Assessment>(`/assessments/${id}`);
}

export async function createAssessment(topicId: string, data: Partial<Assessment>) {
  return apiClient.post<Assessment>(`/topics/${topicId}/assessments`, data);
}

export async function updateAssessment(id: string, data: Partial<Assessment>) {
  return apiClient.patch<Assessment>(`/assessments/${id}`, data);
}

export async function deleteAssessment(id: string) {
  return apiClient.delete<void>(`/assessments/${id}`);
}

export async function publishAssessment(id: string) {
  return apiClient.post<{ success: boolean }>(`/assessments/${id}/publish`, {});
}

export async function archiveAssessment(id: string) {
  return apiClient.post<{ success: boolean }>(`/assessments/${id}/archive`, {});
}

export async function getAssessmentQuestions(id: string) {
  return apiClient.get<Question[]>(`/assessments/${id}/questions`);
}

export async function addQuestionsToAssessment(id: string, data: { questionIds: string[] }) {
  return apiClient.post<void>(`/assessments/${id}/questions`, data);
}

export async function replaceAssessmentQuestions(id: string, data: { questionIds: string[] }) {
  return apiClient.put<void>(`/assessments/${id}/questions`, data);
}

export async function removeQuestionFromAssessment(id: string, assessmentQuestionId: string) {
  return apiClient.delete<void>(`/assessments/${id}/questions/${assessmentQuestionId}`);
}

export async function getAssessmentSettings(id: string) {
  return apiClient.get<any>(`/assessments/${id}/settings`);
}

export async function updateAssessmentSettings(id: string, data: any) {
  return apiClient.patch<any>(`/assessments/${id}/settings`, data);
}

export async function getAssessmentParticipants(id: string) {
  return apiClient.get<Participant[]>(`/assessments/${id}/participants`);
}

export async function addParticipantToAssessment(id: string, data: { participantId: string }) {
  return apiClient.post<void>(`/assessments/${id}/participants`, data);
}

export async function removeParticipantFromAssessment(id: string, participantId: string) {
  return apiClient.delete<void>(`/assessments/${id}/participants/${participantId}`);
}
