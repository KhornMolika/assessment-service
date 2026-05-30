import type { Topic } from "@/src/types";

export type ManagedTopic = Topic & {
  usage?: {
    banks: number;
    questions: number;
    assessments: number;
  };
};

export const TOPICS_STORAGE_KEY = "assessment-service:managed-topics";
export const TOPICS_UPDATED_EVENT = "assessment-service:topics-updated";

export function readManagedTopicsFromStorage() {
  if (typeof window === "undefined") {
    return [];
  }

  const rawValue = window.localStorage.getItem(TOPICS_STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as ManagedTopic[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
