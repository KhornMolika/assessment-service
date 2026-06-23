"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/src/lib/api-client";
import type { AssessmentCatalogItem, AssessmentDetailPageData } from "@/src/types";

export async function createAssessmentAction(topicId: string, data: any) {
  try {
    const newAssessment = await apiClient.post<AssessmentCatalogItem>(`/topics/${topicId}/assessments`, data);
    revalidatePath("/assessments");
    revalidatePath("/search");
    revalidatePath("/");
    return { success: true, assessment: newAssessment };
  } catch (error: any) {
    console.error("Failed to create assessment:", error);
    return { success: false, error: error.message || "Failed to create assessment" };
  }
}

export async function updateAssessmentAction(id: string, data: any) {
  try {
    const updatedAssessment = await apiClient.patch<AssessmentDetailPageData>(`/assessments/${id}`, data);
    revalidatePath(`/assessments/${id}`);
    revalidatePath("/assessments");
    revalidatePath("/search");
    revalidatePath("/");
    return { success: true, assessment: updatedAssessment };
  } catch (error: any) {
    console.error("Failed to update assessment:", error);
    return { success: false, error: error.message || "Failed to update assessment" };
  }
}

export async function deleteAssessmentAction(id: string) {
  try {
    await apiClient.delete(`/assessments/${id}`);
    revalidatePath("/assessments");
    revalidatePath("/search");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete assessment:", error);
    return { success: false, error: error.message || "Failed to delete assessment" };
  }
}

export async function publishAssessmentAction(id: string) {
  try {
    const res = await apiClient.post<{ success: boolean }>(`/assessments/${id}/publish`, {});
    revalidatePath(`/assessments/${id}`);
    revalidatePath("/assessments");
    revalidatePath("/");
    return { success: true, data: res };
  } catch (error: any) {
    console.error("Failed to publish assessment:", error);
    return { success: false, error: error.message || "Failed to publish assessment" };
  }
}
