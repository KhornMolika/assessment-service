import { apiClient } from "@/src/lib/api-client";
import type { Topic } from "@/src/types";

export async function getTopics(): Promise<Topic[]> {
  try {
    const response = await apiClient.get<{ data: any[] }>('/topics?limit=10');
    return (response.data || []).map(t => ({
      id: String(t.id),
      name: String(t.name),
      description: String(t.description || ""),
      created_at: String(t.createdAt || new Date().toISOString())
    }));
  } catch (_err) {
    return [];
  }
}
