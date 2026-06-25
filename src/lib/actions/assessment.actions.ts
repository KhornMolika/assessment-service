"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/src/lib/api-client";
import type { AssessmentCatalogItem, AssessmentDetailPageData } from "@/src/types";

export async function createAssessmentAction(topicId: string, data: any) {
  try {
    // 1. Create base assessment
    const basePayload = {
      name: data.name,
      type: data.type || "QUIZ",
      description: data.description,
    };
    const newAssessmentRaw = await apiClient.post<AssessmentCatalogItem | { data: AssessmentCatalogItem }>(`/topics/${topicId}/assessments`, basePayload);
    const newAssessment = (newAssessmentRaw as any).data || newAssessmentRaw;
    const assessmentId = newAssessment?.id;

    if (!assessmentId) {
      throw new Error("Failed to extract Assessment ID from the creation response.");
    }

    // 2. Update settings
    const settingsPayload = {
      mode: data.sessionMode,
      questionSelection: data.questionSelection,
      participantIdentity: data.participantIdentity,
      numQuestions: data.questionSelection === "MANUAL" 
        ? Math.max(1, data.selectedQuestionIds?.length || 1) 
        : Math.max(1, data.totalQuestions || 1),
      timeLimit: data.enableTimeLimit ? data.timeLimitMinutes : null,
      startsAt: data.startsAt || null,
      endsAt: data.endsAt || null,
      passMark: data.passMark,
      isShuffle: data.shuffleQuestions,
      showResults: data.showResults,
      gradeLabels: data.gradeLabels.map((l: any) => ({ name: l.grade, min: l.minPercent })),
      selectionRules: data.questionSelection === "DYNAMIC" ? {
        source: data.selectedBankId ? "bank" : "topic",
        bankId: data.selectedBankId || undefined,
        total: data.totalQuestions,
        distribution: {
          easy: data.selectionRules.find((r: any) => r.difficulty === "Easy")?.count || 0,
          medium: data.selectionRules.find((r: any) => r.difficulty === "Medium")?.count || 0,
          hard: data.selectionRules.find((r: any) => r.difficulty === "Hard")?.count || 0,
        }
      } : undefined,
    };
    await apiClient.patch(`/assessments/${assessmentId}/settings`, settingsPayload);

    // 3. Update questions (if manual and has questions)
    if (data.questionSelection === "MANUAL" && data.selectedQuestionIds && data.selectedQuestionIds.length > 0) {
      const payload = data.selectedQuestionIds.map((id: string) => ({ questionId: id }));
      await apiClient.post(`/assessments/${assessmentId}/questions`, payload);
    }

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
    // 1. Update base assessment
    const basePayload = {
      name: data.name,
      type: data.type || "QUIZ",
      description: data.description,
    };
    const updatedAssessment = await apiClient.patch<AssessmentDetailPageData>(`/assessments/${id}`, basePayload);

    // 2. Update settings
    const settingsPayload = {
      mode: data.sessionMode,
      questionSelection: data.questionSelection,
      participantIdentity: data.participantIdentity,
      numQuestions: data.questionSelection === "MANUAL" 
        ? Math.max(1, data.selectedQuestionIds?.length || 1) 
        : Math.max(1, data.totalQuestions || 1),
      timeLimit: data.enableTimeLimit ? data.timeLimitMinutes : null,
      startsAt: data.startsAt || null,
      endsAt: data.endsAt || null,
      passMark: data.passMark,
      isShuffle: data.shuffleQuestions,
      showResults: data.showResults,
      gradeLabels: data.gradeLabels.map((l: any) => ({ name: l.grade, min: l.minPercent })),
      selectionRules: data.questionSelection === "DYNAMIC" ? {
        source: data.selectedBankId ? "bank" : "topic",
        bankId: data.selectedBankId || undefined,
        total: data.totalQuestions,
        distribution: {
          easy: data.selectionRules.find((r: any) => r.difficulty === "Easy")?.count || 0,
          medium: data.selectionRules.find((r: any) => r.difficulty === "Medium")?.count || 0,
          hard: data.selectionRules.find((r: any) => r.difficulty === "Hard")?.count || 0,
        }
      } : undefined,
    };
    await apiClient.patch(`/assessments/${id}/settings`, settingsPayload);

    // 3. Update questions (if manual and has questions)
    if (data.questionSelection === "MANUAL") {
      const initialIds = data.initialQuestionIds || [];
      const currentIds = data.selectedQuestionIds || [];
      
      const addedIds = currentIds.filter((id: string) => !initialIds.includes(id));
      const removedIds = initialIds.filter((id: string) => !currentIds.includes(id));

      if (addedIds.length > 0) {
        const payload = addedIds.map((id: string) => ({ questionId: id }));
        await apiClient.post(`/assessments/${id}/questions`, payload);
      }

      for (const removedId of removedIds) {
        await apiClient.delete(`/assessments/${id}/questions/${removedId}`);
      }
    }

    // 4. Handle status transitions if changed
    if (data.status) {
      const currentAssessmentRaw = await apiClient.get<AssessmentDetailPageData>(`/assessments/${id}`);
      const currentAssessment = (currentAssessmentRaw as any).data || currentAssessmentRaw;
      const originalStatus = currentAssessment.status;

      if (originalStatus === "DRAFT" && data.status === "PUBLISHED") {
        await apiClient.post(`/assessments/${id}/publish`, {});
      } else if (originalStatus === "PUBLISHED" && data.status === "ARCHIVED") {
        await apiClient.post(`/assessments/${id}/archive`, {});
      }
    }

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

export async function archiveAssessmentAction(id: string) {
  try {
    const res = await apiClient.post<{ success: boolean }>(`/assessments/${id}/archive`, {});
    revalidatePath(`/assessments/${id}`);
    revalidatePath("/assessments");
    revalidatePath("/");
    return { success: true, data: res };
  } catch (error: any) {
    console.error("Failed to archive assessment:", error);
    return { success: false, error: error.message || "Failed to archive assessment" };
  }
}
