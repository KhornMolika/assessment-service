import { apiClient } from "../api-client";
import type { PaginatedResponse, Participant } from "@/src/types/api";

export async function getParticipants(page = 1, limit = 10) {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  return apiClient.get<PaginatedResponse<Participant>>(`/participants?${queryParams}`);
}

export async function getParticipantById(id: string) {
  return apiClient.get<Participant>(`/participants/${id}`);
}

export async function createParticipant(data: Partial<Participant>) {
  return apiClient.post<Participant>("/participants", data);
}

export async function updateParticipant(id: string, data: Partial<Participant>) {
  return apiClient.patch<Participant>(`/participants/${id}`, data);
}

export async function deleteParticipant(id: string) {
  return apiClient.delete<void>(`/participants/${id}`);
}
