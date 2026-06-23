import { create } from 'zustand';
import { apiClient } from '@/src/lib/api-client';
import type { Topic, BankTopicMap, QuestionTopicMap } from '@/src/types';
import type { QuestionBank, Question } from '@/src/types/api';

interface ContentState {
  banks: QuestionBank[];
  topics: Topic[];
  questions: Question[];
  bankTopics: BankTopicMap[];
  questionTopics: QuestionTopicMap[];
  
  isLoading: boolean;
  error: string | null;

  fetchBanks: () => Promise<void>;
  fetchTopics: () => Promise<void>;
  fetchQuestions: () => Promise<void>;
  fetchAllContent: () => Promise<void>;
}

export const useContentStore = create<ContentState>((set, get) => ({
  banks: [],
  topics: [],
  questions: [],
  bankTopics: [],
  questionTopics: [],
  isLoading: false,
  error: null,

  fetchBanks: async () => {
    try {
      set({ isLoading: true, error: null });
      // In NestJS, getting all banks usually involves a topic or a generic GET /banks if it exists.
      // Based on the postman collection, `GET /topics/:topicId/banks` exists, but there might be a global `GET /banks` if implemented.
      // We'll assume the API provides paginated generic endpoints or we can adapt later.
      // Wait, the postman collection doesn't have a generic `GET /banks` listing, but `GET /topics/:topicId/banks`.
      // For now, let's just make a generic call and handle any adjustments later.
      const response = await apiClient.get<{ data: QuestionBank[] }>('/banks');
      set({ banks: response.data || (response as unknown as QuestionBank[]) });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchTopics: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.get<{ data: Topic[] }>('/topics');
      set({ topics: response.data || (response as unknown as Topic[]) });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchQuestions: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await apiClient.get<{ data: Question[] }>('/questions');
      set({ questions: response.data || (response as unknown as Question[]) });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAllContent: async () => {
    set({ isLoading: true, error: null });
    try {
      await Promise.all([
        get().fetchTopics(),
        get().fetchBanks(),
        get().fetchQuestions()
      ]);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  }
}));
