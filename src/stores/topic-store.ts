import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Topic {
  id: string;          // UUID
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
}

interface TopicStore {
  activeTopic: Topic | null;
  topics: Topic[];
  isLoading: boolean;
  setActiveTopic: (topic: Topic | null) => void;
  setTopics: (topics: Topic[]) => void;
  setLoading: (v: boolean) => void;
}

export const useTopicStore = create<TopicStore>()(
  persist(
    (set) => ({
      activeTopic: null,
      topics: [],
      isLoading: false,
      setActiveTopic: (topic) => set({ activeTopic: topic }),
      setTopics: (topics) => set({ topics }),
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'topic-store', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      partialize: (state) => ({ activeTopic: state.activeTopic }),
    }
  )
);
