"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { apiClient } from "@/src/lib/api-client";
import { StartSessionDto, SaveAnswerDto } from "@/src/types/runtime.types";

const getSessionCookieName = (assessmentId: string) => `assessment_session_${assessmentId}`;

export async function getActiveSessionId(assessmentId: string) {
  const cookieStore = await cookies();
  return cookieStore.get(getSessionCookieName(assessmentId))?.value;
}

export async function startSelfPacedSession(
  assessmentId: string, 
  participant?: { name: string; email: string }
) {
  try {
    let participantId: string | undefined = undefined;

    // Create participant if info is provided
    if (participant?.name) {
      const pRes = await apiClient.post<any>("/participants", participant);
      participantId = pRes.id || pRes.data?.id;
    }

    const payload: StartSessionDto = { assessmentId, participantId };
    
    // Check if we already have a session
    const existingSessionId = await getActiveSessionId(assessmentId);
    if (existingSessionId && !participant?.name) {
      return { success: true, data: { sessionId: existingSessionId } };
    }

    const res = await apiClient.post<any>(`/runtime/sessions/start`, payload);
    const sessionId = res.sessionId || res.data?.sessionId;

    if (sessionId) {
      const cookieStore = await cookies();
      cookieStore.set(getSessionCookieName(assessmentId), sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        // expires in 24 hours
        maxAge: 60 * 60 * 24,
      });
      return { success: true, data: res.data || res };
    }
    
    return { success: false, message: "Failed to start session" };
  } catch (error: any) {
    console.error("startSelfPacedSession error:", error);
    return { success: false, message: error.message || "Something went wrong" };
  }
}

export async function saveAnswerIncremental(sessionId: string, assessmentQuestionId: string, response: any) {
  try {
    const payload: SaveAnswerDto = { assessmentQuestionId, response };
    const res = await apiClient.post(`/runtime/sessions/${sessionId}/answers`, payload);
    return { success: true, data: res };
  } catch (error: any) {
    console.error("saveAnswerIncremental error:", error);
    return { success: false, message: error.message || "Failed to save answer" };
  }
}

export async function submitSelfPacedSession(sessionId: string, assessmentId: string) {
  try {
    const res = await apiClient.post(`/runtime/sessions/${sessionId}/submit`, {});
    
    // clear the cookie since session is done
    const cookieStore = await cookies();
    cookieStore.delete(getSessionCookieName(assessmentId));

    return { success: true, data: res };
  } catch (error: any) {
    console.error("submitSelfPacedSession error:", error);
    return { success: false, message: error.message || "Failed to submit session" };
  }
}

export async function getSessionResult(sessionId: string) {
  try {
    const res = await apiClient.get<any>(`/runtime/sessions/${sessionId}/result`);
    return { success: true, data: res.data || res };
  } catch (error: any) {
    console.error("getSessionResult error:", error);
    return { success: false, message: error.message || "Failed to get result" };
  }
}

export async function startRealtimeSessionHost(assessmentId: string) {
  try {
    const res = await apiClient.post<any>(`/runtime/real-time/${assessmentId}/start`, {});
    return { success: true, data: res.data || res };
  } catch (error: any) {
    console.error("startRealtimeSessionHost error:", error);
    return { success: false, message: error.message || "Failed to start real-time session" };
  }
}

export async function getRealtimeUrl() {
  return process.env.API_URL?.replace('/api/v1', '');
}