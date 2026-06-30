"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/src/lib/api-client";

export async function saveManualReviewAction(
  sessionId: string,
  entryId: string,
  scoreAwarded: number,
) {
  try {
    const res = await apiClient.patch<{
      entryId: string;
      sessionId: string;
      scoreAwarded: number;
      gradingStatus: "MANUAL_REVISED";
      savedAt: string;
    }>(`/assessments/${sessionId}/entries/${entryId}/review`, {
      scoreAwarded,
    });
    await apiClient.post(`/assessments/${sessionId}/recalculate`, {});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = (res as any)?.data ?? res;

    revalidatePath(`/results/${sessionId}`);
    revalidatePath("/results");

    return { success: true, data: payload };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save manual review.",
    };
  }
}

export async function recalculateResultAction(sessionId: string) {
  try {
    const res = await apiClient.post<{
      sessionId: string;
      totalScore: number;
      maxScore: number;
      scorePercent: number;
      grade: string;
      isPassed: boolean;
      status: string;
      recalculatedAt: string;
    }>(`/assessments/${sessionId}/recalculate`, {});

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const payload = (res as any)?.data?.data ?? (res as any)?.data ?? res;

    revalidatePath(`/results/${sessionId}`);
    revalidatePath("/results");

    return { success: true, data: payload };
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to recalculate result.",
    };
  }
}
