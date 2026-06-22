"use server";

import { Topic } from "@/src/stores/topic-store";
import { fetchWithAuth } from "./fetch-utils";

export async function fetchTopics(): Promise<Topic[]> {
  const data = await fetchWithAuth("/topics?page=1&limit=100&sortBy=createdAt&order=DESC");
  // Assuming the envelope has data.data based on usual NestJS pagination, or it's directly data
  return Array.isArray(data.data) ? data.data : data;
}

export async function createTopic(payload: { name: string; description?: string }): Promise<Topic> {
  const data = await fetchWithAuth("/topics", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.data || data;
}

export async function updateTopic(id: string, payload: { name?: string; description?: string }): Promise<Topic> {
  const data = await fetchWithAuth(`/topics/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  return data.data || data;
}

export async function deleteTopic(id: string): Promise<void> {
  await fetchWithAuth(`/topics/${id}`, {
    method: "DELETE",
  });
}
