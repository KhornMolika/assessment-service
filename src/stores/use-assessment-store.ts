import { create } from "zustand";
import { apiClient } from "@/src/lib/api-client";
import type {
  AssessmentCatalogItem,
  Participant,
  AnswerSheet,
  ResultQuestionEntity,
} from "@/src/types";

interface AssessmentState {
  assessments: AssessmentCatalogItem[];
  participants: Participant[];
  answerSheets: AnswerSheet[];
  resultQuestions: ResultQuestionEntity[];

  isLoading: boolean;
  error: string | null;

  fetchAssessments: () => Promise<void>;
  fetchParticipants: () => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useAssessmentStore = create<AssessmentState>((set, get) => ({
  assessments: [],
  participants: [],
  answerSheets: [],
  resultQuestions: [],
  isLoading: false,
  error: null,

  fetchAssessments: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.get<{ data: AssessmentCatalogItem[] }>(
        "/assessments?limit=500",
      );
      set({
        assessments:
          response.data || (response as unknown as AssessmentCatalogItem[]),
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchParticipants: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.get<{ data: Participant[] }>(
        "/participants?limit=500",
      );
      set({
        participants: response.data || (response as unknown as Participant[]),
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
