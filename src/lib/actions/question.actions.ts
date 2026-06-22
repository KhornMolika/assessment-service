"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/src/lib/api-client";
import type { Question } from "@/src/types/api";

export async function createQuestionAction(topicId: string, data: any) {
  try {
    const newQuestion = await apiClient.post<Question>(`/topics/${topicId}/questions`, data);
    revalidatePath("/questions");
    revalidatePath("/search");
    revalidatePath("/");
    return { success: true, question: newQuestion };
  } catch (error: any) {
    console.error("Failed to create question:", error);
    return { success: false, error: error.message || "Failed to create question" };
  }
}

export async function updateQuestionAction(id: string, data: any) {
  try {
    const updatedQuestion = await apiClient.patch<Question>(`/questions/${id}`, data);
    revalidatePath(`/questions/${id}`);
    revalidatePath("/questions");
    revalidatePath("/search");
    revalidatePath("/");
    return { success: true, question: updatedQuestion };
  } catch (error: any) {
    console.error("Failed to update question:", error);
    return { success: false, error: error.message || "Failed to update question" };
  }
}

export async function deleteQuestionAction(id: string) {
  try {
    await apiClient.delete(`/questions/${id}`);
    revalidatePath("/questions");
    revalidatePath("/search");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete question:", error);
    return { success: false, error: error.message || "Failed to delete question" };
  }
}
