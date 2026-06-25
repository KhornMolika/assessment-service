import { apiClient } from "@/src/lib/api-client";
import type { BankTopicMap } from "@/src/types";
import type { QuestionBank, Question } from "@/src/types/api";

export async function getBanks(): Promise<QuestionBank[]> {
  console.log(process.env.API_URL + "/banks");

  try {
    const response = await apiClient.get<{ data: any[] }>("/banks?limit=500");
    return (response.data || []).map((b) => ({
      id: String(b.id),
      name: String(b.name),
      description: String(b.description || ""),
      tags: Array.isArray(b.tags) ? b.tags : [],
      visibility: b.visibility || "PRIVATE",
      questionCount: 0,
      createdAt: String(b.createdAt || new Date().toISOString()),
    })) as unknown as QuestionBank[];
  } catch (err) {
    console.warn(
      "Failed to fetch banks:",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

export async function getBankById(
  id: string,
): Promise<QuestionBank | undefined> {
  try {
    const response = await apiClient.get<QuestionBank>(`/banks/${id}`);
    return response;
  } catch {
    return undefined;
  }
}

export async function getBankTopics(): Promise<BankTopicMap[]> {
  // If the backend doesn't have this exact junction route yet, return empty array for now
  return [];
}

export async function getBankDetailPageData(id: string): Promise<{
  bank: QuestionBank | undefined;
  bankQuestions: Question[];
}> {
  try {
    const [bankRes, questionsRes] = await Promise.all([
      apiClient.get<QuestionBank>(`/banks/${id}`),
      apiClient.get<{ data: Record<string, unknown>[] }>(
        `/banks/${id}/questions`,
      ),
    ]);

    return {
      bank: bankRes,
      bankQuestions: (
        (questionsRes.data || questionsRes || []) as Record<string, unknown>[]
      ).map((q) => ({
        id: String(q.id),
        questionText: String(q.questionText || q.text),
        type: String(q.type) as any,
        topicId: id,
        points: Number(q.points || 5),
        createdAt: String(q.createdAt || new Date().toISOString()),
        updatedAt: String(q.updatedAt || new Date().toISOString()),
        clientId: "",
        difficulty: "MEDIUM" as any,
        options: null,
        correctAnswer: null,
      })),
    };
  } catch (err) {
    console.warn(
      "Failed to fetch bank detail page data:",
      err instanceof Error ? err.message : err,
    );
    return { bank: undefined, bankQuestions: [] };
  }
}
