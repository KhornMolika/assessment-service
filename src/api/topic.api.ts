import { apiClient } from "@/src/lib/api-client";
import type { Topic } from "@/src/types";

export async function getTopics(): Promise<Topic[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await apiClient.get<{ data: any[] }>("/topics?limit=500");
    return (response.data || []).map((t) => ({
      id: String(t.id),
      name: String(t.name),
      description: String(t.description || ""),
      createdAt: String(t.createdAt || new Date().toISOString()),
    }));
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (_err) {
    return [];
  }
}
