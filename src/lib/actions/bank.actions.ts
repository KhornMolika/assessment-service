"use server";

import { revalidatePath } from "next/cache";
import { apiClient } from "@/src/lib/api-client";
import type { Bank } from "@/src/types";

export async function createBankAction(topicId: string, data: { name: string; description: string; tags: string[]; visibility: string }) {
  try {
    const newBank = await apiClient.post<Bank>(`/topics/${topicId}/banks`, data);
    revalidatePath("/banks");
    revalidatePath("/search");
    revalidatePath("/");
    return { success: true, bank: newBank };
  } catch (error: any) {
    console.error("Failed to create bank:", error);
    return { success: false, error: error.message || "Failed to create question bank" };
  }
}

export async function updateBankAction(id: string, data: { name?: string; description?: string; tags?: string[]; visibility?: string }) {
  try {
    const updatedBank = await apiClient.patch<Bank>(`/banks/${id}`, data);
    revalidatePath(`/banks/${id}`);
    revalidatePath("/banks");
    revalidatePath("/search");
    revalidatePath("/");
    return { success: true, bank: updatedBank };
  } catch (error: any) {
    console.error("Failed to update bank:", error);
    return { success: false, error: error.message || "Failed to update question bank" };
  }
}

export async function deleteBankAction(id: string) {
  try {
    await apiClient.delete(`/banks/${id}`);
    revalidatePath("/banks");
    revalidatePath("/search");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to delete bank:", error);
    return { success: false, error: error.message || "Failed to delete question bank" };
  }
}
