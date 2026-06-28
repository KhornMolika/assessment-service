"use server";

import { revalidatePath } from "next/cache";
import { createTopic, updateTopic, deleteTopic } from "../services/topics";

export async function createTopicAction(data: { name: string; description: string }) {
  try {
    const newTopic = await createTopic(data);
    revalidatePath("/topics");
    revalidatePath("/assessments");
    revalidatePath("/");
    return { success: true, topic: newTopic };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Failed to create topic:", error);
    return { success: false, error: error.message || "Failed to create topic" };
  }
}

export async function updateTopicAction(id: string, data: { name: string; description: string }) {
  try {
    const updatedTopic = await updateTopic(id, data);
    revalidatePath("/topics");
    revalidatePath("/assessments");
    revalidatePath("/");
    return { success: true, topic: updatedTopic };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Failed to update topic:", error);
    return { success: false, error: error.message || "Failed to update topic" };
  }
}

export async function deleteTopicAction(id: string) {
  try {
    await deleteTopic(id);
    revalidatePath("/topics");
    revalidatePath("/assessments");
    revalidatePath("/");
    return { success: true };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Failed to delete topic:", error);
    return { success: false, error: error.message || "Failed to delete topic" };
  }
}
