"use server";

import { fetchWithAuth } from "./fetch-utils";

export interface Assessment {
  id: string;
  name: string;
  type: string;
  description?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AssessmentSettings {
  mode?: "SELF_PACED" | "LIVE";
  questionSelection?: "MANUAL" | "RANDOM" | "BANK";
  participantIdentity?: "ANONYMOUS" | "NAMED" | "EXTERNAL";
  numQuestions?: number;
  timeLimit?: number | null;
  passMark?: number;
  isShuffle?: boolean;
  showResults?: "IMMEDIATELY" | "AFTER_DEADLINE" | "MANUAL" | "NEVER";
  gradeLabels?: object;
  isAllowShare?: boolean;
  allowReview?: boolean;
  manualGradingAIQues?: boolean;
  startsAt?: string;
  endsAt?: string;
}

export type CreateAssessmentPayload = {
  name: string;
  type: "EXAM" | "QUIZ" | "SURVEY" | "PRACTICE";
  description?: string;
};

export type UpdateAssessmentPayload = {
  name?: string;
  description?: string;
};

export async function createAssessment(topicId: string, payload: CreateAssessmentPayload): Promise<Assessment> {
  const data = await fetchWithAuth(`/topics/${topicId}/assessments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data || data;
}

export async function updateAssessment(id: string, payload: UpdateAssessmentPayload): Promise<Assessment> {
  const data = await fetchWithAuth(`/assessments/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return data.data || data;
}

export async function publishAssessment(id: string): Promise<void> {
  await fetchWithAuth(`/assessments/${id}/publish`, {
    method: "POST",
  });
}

export async function archiveAssessment(id: string): Promise<void> {
  await fetchWithAuth(`/assessments/${id}/archive`, {
    method: "POST",
  });
}

export async function deleteAssessment(id: string): Promise<void> {
  await fetchWithAuth(`/assessments/${id}`, {
    method: "DELETE",
  });
}

export async function fetchTopicAssessments(topicId: string): Promise<Assessment[]> {
  const data = await fetchWithAuth(`/topics/${topicId}/assessments`);
  return Array.isArray(data.data) ? data.data : data;
}

export async function fetchGlobalAssessments(): Promise<Assessment[]> {
  const data = await fetchWithAuth(`/assessments`);
  return Array.isArray(data.data) ? data.data : data;
}

export async function fetchAssessmentSettings(id: string): Promise<AssessmentSettings> {
  const data = await fetchWithAuth(`/assessments/${id}/settings`);
  return data.data || data;
}

export async function updateAssessmentSettings(id: string, payload: Partial<AssessmentSettings>): Promise<AssessmentSettings> {
  const data = await fetchWithAuth(`/assessments/${id}/settings`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return data.data || data;
}

export async function addQuestionsToAssessment(id: string, questionIds: string[]): Promise<void> {
  await fetchWithAuth(`/assessments/${id}/questions`, {
    method: "POST",
    body: JSON.stringify({ questionIds }),
  });
}

export async function replaceAssessmentQuestions(id: string, questionIds: string[]): Promise<void> {
  await fetchWithAuth(`/assessments/${id}/questions`, {
    method: "PUT",
    body: JSON.stringify({ questionIds }),
  });
}

export async function removeQuestionFromAssessment(id: string, assessmentQuestionId: string): Promise<void> {
  await fetchWithAuth(`/assessments/${id}/questions/${assessmentQuestionId}`, {
    method: "DELETE",
  });
}
