import { Plus } from "lucide-react";
import Link from "next/link";
import {
  getDashboardAnalytics,
  getDashboardOverviewSections,
} from "../domains/dashboard/api/dashboard.api";
import AssessmentParticipantTrend from "../domains/dashboard/components/AssessmentParticipantTrend";
import CreatorSnapshot from "../domains/dashboard/components/CreatorSnapshot";
import OperationalHighlights from "../domains/dashboard/components/OperationalHighlights";
import QuickLaunchpad from "../domains/dashboard/components/QuickLaunchpad";
import RecentAssessmentTable from "../domains/dashboard/components/RecentAssessmentTable";
import ScoreDistribution from "../domains/dashboard/components/ScoreDistribution";
import StatsGridSection from "../domains/dashboard/components/StatsGridSection";

export default async function DashboardPage() {
  const dashboardOverview = await getDashboardOverviewSections();
  const dashboardAnalytics = await getDashboardAnalytics();

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="mb-1 text-2xl font-bold text-primary">Welcome, Molika!</h2>
          <p className="text-sm text-inkl">Sunday, March 29, 2026</p>
        </div>
        <Link
          href="/assessments/new"
          className="mt-4 inline-flex w-44 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New assessment
        </Link>
      </div>

      <StatsGridSection items={dashboardOverview.stats} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <AssessmentParticipantTrend data={dashboardAnalytics.sessionActivity} />
        <ScoreDistribution data={dashboardAnalytics.scoreDistribution} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <OperationalHighlights items={dashboardOverview.operationalHighlights} />
        <QuickLaunchpad items={dashboardOverview.quickLaunchpad} />
        <CreatorSnapshot items={dashboardOverview.creatorSnapshot} />
      </div>

      <RecentAssessmentTable items={dashboardAnalytics.recentAssessments} />
    </div>
  );
}
