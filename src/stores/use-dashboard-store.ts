import { create } from 'zustand';
import { getDashboardOverviewSections, getDashboardAnalytics } from '@/src/api/dashboard.api';
import type { DashboardOverviewSections, DashboardAnalytics } from '@/src/types/dashboard.types';

interface DashboardState {
  overviewSections: DashboardOverviewSections | null;
  analytics: DashboardAnalytics | null;
  
  isLoading: boolean;
  error: string | null;

  fetchDashboardData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  overviewSections: null,
  analytics: null,
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    try {
      set({ isLoading: true, error: null });
      const [overview, analytics] = await Promise.all([
        getDashboardOverviewSections(),
        getDashboardAnalytics()
      ]);
      set({ overviewSections: overview, analytics });
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  }
}));
