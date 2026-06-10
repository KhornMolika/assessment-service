"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/src/lib/api-client";
import type { Topic } from "@/src/types";

export async function createTopicAction(data: { name: string; description: string }) {
  try {
    const newTopic = await apiClient.post<Topic>("/topics", data);
    revalidatePath("/topics");
    revalidatePath("/assessments");
    revalidatePath("/");
    return { success: true, topic: newTopic };
  } catch (error: any) {
    console.warn("Failed to create topic:", error instanceof Error ? error.message : String(error));
    return { success: false, error: error.message || "Failed to create topic" };
  }
}

export async function updateTopicAction(id: string, data: { name: string; description: string }) {
  try {
    const updatedTopic = await apiClient.patch<Topic>(`/topics/${id}`, data);
    revalidatePath("/topics");
    revalidatePath("/assessments");
    revalidatePath("/");
    return { success: true, topic: updatedTopic };
  } catch (error: any) {
    console.warn("Failed to update topic:", error instanceof Error ? error.message : String(error));
    return { success: false, error: error.message || "Failed to update topic" };
  }
}

export async function deleteTopicAction(id: string) {
  try {
    await apiClient.delete(`/topics/${id}`);
    revalidatePath("/topics");
    revalidatePath("/assessments");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.warn("Failed to delete topic:", error instanceof Error ? error.message : String(error));
    return { success: false, error: error.message || "Failed to delete topic" };
  }
}
