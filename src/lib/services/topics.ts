import { apiClient } from "../api-client";
import type { PaginatedResponse, Topic } from "@/src/types/api";

export async function getTopics(page = 1, limit = 10, search?: string) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (search) queryParams.append("search", search);

  return apiClient.get<PaginatedResponse<Topic>>(`/topics?${queryParams}`);
}

export async function getTopicById(id: string) {
  return apiClient.get<Topic>(`/topics/${id}`);
}

export async function createTopic(data: Partial<Topic>) {
  return apiClient.post<Topic>("/topics", data);
}

export async function updateTopic(id: string, data: Partial<Topic>) {
  return apiClient.patch<Topic>(`/topics/${id}`, data);
}

export async function deleteTopic(id: string) {
  return apiClient.delete<void>(`/topics/${id}`);
}
