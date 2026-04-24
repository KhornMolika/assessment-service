import { Plus } from "lucide-react";
import Link from "next/link";
import {
  getDashboardOverviewSections,
} from "../domains/dashboard/api/dashboard.api";
import OperationalHighlights from "../domains/dashboard/components/OperationalHighlights";
import QuickLaunchpad from "../domains/dashboard/components/QuickLaunchpad";
import RecentAssessmentTable from "../domains/dashboard/components/RecentAssessmentTable";
import StatsGridSection from "../domains/dashboard/components/StatsGridSection";
import { getDashboardAnalytics } from "../domains/dashboard/api/dashboard.api";
import { PageHeaderCard } from "../shared/components/layout/PageHeaderCard";

export default async function DashboardPage() {
  const dashboardOverview = await getDashboardOverviewSections();
  const dashboardAnalytics = await getDashboardAnalytics();

  return (
    <div className="space-y-6 bg-[linear-gradient(180deg,#F7FAF8_0%,#FFFFFF_30%,#F6FAF7_100%)] p-4">
      <PageHeaderCard
        title="Dashboard"
        description="Focus on the current workspace footprint, pending operational work, and the latest assessment activity."
        actions={
          <Link
            href="/assessments/new"
            className="inline-flex w-44 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New assessment
          </Link>
        }
      />

      <StatsGridSection items={dashboardOverview.stats} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OperationalHighlights items={dashboardOverview.operationalHighlights} />
        <QuickLaunchpad items={dashboardOverview.quickLaunchpad} />
      </div>

      <RecentAssessmentTable items={dashboardAnalytics.recentAssessments} />
    </div>
  );
}
