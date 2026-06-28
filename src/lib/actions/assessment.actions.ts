"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/src/lib/api-client";
import type { AssessmentCatalogItem, AssessmentDetailPageData } from "@/src/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createAssessmentAction(topicId: string, data: any) {
  try {
    // 1. Create base assessment
    const basePayload = {
      name: data.name,
      type: data.type || "QUIZ",
      description: data.description,
    };
    const newAssessmentRaw = await apiClient.post<AssessmentCatalogItem | { data: AssessmentCatalogItem }>(`/topics/${topicId}/assessments`, basePayload);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gradeLabels: data.gradeLabels.map((l: any) => ({ name: l.grade, min: l.minPercent })),
      selectionRules: data.questionSelection === "DYNAMIC" ? {
        source: data.selectedBankId ? "bank" : "topic",
        bankId: data.selectedBankId || undefined,
        total: data.totalQuestions,
        distribution: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          easy: data.selectionRules.find((r: any) => r.difficulty === "Easy")?.count || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          medium: data.selectionRules.find((r: any) => r.difficulty === "Medium")?.count || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Failed to create assessment:", error);
    return { success: false, error: error.message || "Failed to create assessment" };
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function updateAssessmentAction(id: string, data: any) {
  try {
    // 0. Check current status
    const currentAssessmentRaw = await apiClient.get<AssessmentDetailPageData>(`/assessments/${id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentAssessment = (currentAssessmentRaw as any).data || currentAssessmentRaw;
    const originalStatus = currentAssessment.status;
    const isPublishedOrArchived = originalStatus === "PUBLISHED" || originalStatus === "ARCHIVED";

    let updatedAssessment = currentAssessment;

    // 1. Update base assessment (skip if published/archived as backend blocks it)
    if (!isPublishedOrArchived) {
      const basePayload = {
        name: data.name,
        type: data.type || "QUIZ",
        description: data.description,
      };
      updatedAssessment = await apiClient.patch<AssessmentDetailPageData>(`/assessments/${id}`, basePayload);
    }

    // 2. Update settings. Published assessments can only change their schedule.
    const schedulePayload = {
      timeLimit: data.enableTimeLimit ? data.timeLimitMinutes : null,
      startsAt: data.startsAt || null,
      endsAt: data.endsAt || null,
    };
    const settingsPayload = originalStatus === "PUBLISHED" ? schedulePayload : {
      mode: data.sessionMode,
      questionSelection: data.questionSelection,
      participantIdentity: data.participantIdentity,
      numQuestions: data.questionSelection === "MANUAL" 
        ? Math.max(1, data.selectedQuestionIds?.length || 1) 
        : Math.max(1, data.totalQuestions || 1),
      ...schedulePayload,
      passMark: data.passMark,
      isShuffle: data.shuffleQuestions,
      showResults: data.showResults,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gradeLabels: data.gradeLabels.map((l: any) => ({ name: l.grade, min: l.minPercent })),
      selectionRules: data.questionSelection === "DYNAMIC" ? {
        source: data.selectedBankId ? "bank" : "topic",
        bankId: data.selectedBankId || undefined,
        total: data.totalQuestions,
        distribution: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          easy: data.selectionRules.find((r: any) => r.difficulty === "Easy")?.count || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          medium: data.selectionRules.find((r: any) => r.difficulty === "Medium")?.count || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          hard: data.selectionRules.find((r: any) => r.difficulty === "Hard")?.count || 0,
        }
      } : undefined,
    };
    if (originalStatus !== "ARCHIVED") {
      await apiClient.patch(`/assessments/${id}/settings`, settingsPayload);
    }

    // 3. Update questions (skip if published/archived as backend blocks it)
    if (!isPublishedOrArchived && data.questionSelection === "MANUAL" && data.selectedQuestionIds && data.selectedQuestionIds.length > 0) {
      await apiClient.put(`/assessments/${id}/questions`, {
        questionIds: data.selectedQuestionIds,
      });
    }

    // 4. Handle status transitions if changed
    if (data.status) {

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Failed to delete assessment:", error);
    return { success: false, error: error.message || "Failed to delete assessment" };
  }
}

export async function addQuestionsToAssessmentAction(assessmentId: string, questionIds: string[]) {
  try {
    const payload = questionIds.map((id) => ({ questionId: id }));
    await apiClient.post(`/assessments/${assessmentId}/questions`, payload);
    revalidatePath(`/assessments/${assessmentId}`);
    return { success: true };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to add questions to assessment",
    };
  }
}

export async function removeQuestionFromAssessmentAction(assessmentId: string, assessmentQuestionId: string) {
  try {
    await apiClient.delete(`/assessments/${assessmentId}/questions/${assessmentQuestionId}`);
    revalidatePath(`/assessments/${assessmentId}`);
    return { success: true };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to remove question from assessment",
    };
  }
}

export async function publishAssessmentAction(id: string) {
  try {
    const res = await apiClient.post<{ success: boolean }>(`/assessments/${id}/publish`, {});
    revalidatePath(`/assessments/${id}`);
    revalidatePath("/assessments");
    revalidatePath("/");
    return { success: true, data: res };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Failed to archive assessment:", error);
    return { success: false, error: error.message || "Failed to archive assessment" };
  }
}

export async function getAdminClientId() {
  return process.env.API_CLIENT_ID;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function joinRealTimeSessionAction(assessmentId: string, payload: any) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const res = await apiClient.post<any>(`/assessments/${assessmentId}/join`, payload);
    return { success: true, data: res };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Failed to join real-time session:", error);
    return { success: false, error: error.message || "Failed to join session" };
  }
}
