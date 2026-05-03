import type {
  AssessmentStatus,
  DashboardAnalytics,
  DashboardOverviewSections,
} from "../types/dashboard.types";
import { getAssessmentCatalogPageData } from "@/src/domains/assessment/api/assessment.api";
import {
  getMockBanks,
  getMockQuestions,
  getMockTopics,
} from "@/src/domains/content/api/content.api";
import mockData from "./mock-data.json";

const DASHBOARD_REFERENCE_TIMESTAMP = Date.UTC(2026, 3, 30, 0, 0, 0);
const mockDashboardOverviewSections = mockData.overviewSections as DashboardOverviewSections;
const mockDashboardAnalytics = mockData.analytics as DashboardAnalytics;

function formatRelativeTime(dateString: string) {
  const now = new Date(DASHBOARD_REFERENCE_TIMESTAMP);
  const value = new Date(dateString);
  const diffMs = now.getTime() - value.getTime();
  const diffHours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.max(1, Math.round(diffHours / 24));
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function mapAssessmentStatus(lifecycle: string): AssessmentStatus {
  switch (lifecycle) {
    case "ACTIVE":
      return "Active";
    case "COMPLETED":
      return "Completed";
    case "PENDING":
      return "Pending";
    case "DRAFT":
      return "Scheduled";
    default:
      return "Published";
  }
}

export async function getDashboardOverviewSections(): Promise<DashboardOverviewSections> {
  "use cache";

  const [assessmentPage, banks, questions, topics] = await Promise.all([
    getAssessmentCatalogPageData(),
    getMockBanks(),
    getMockQuestions(),
    getMockTopics(),
  ]);

  return {
    ...mockDashboardOverviewSections,
    stats: [
      {
        ...mockDashboardOverviewSections.stats[0],
        value: `${topics.length}`,
      },
      {
        ...mockDashboardOverviewSections.stats[1],
        value: `${assessmentPage.assessments.length}`,
      },
      {
        ...mockDashboardOverviewSections.stats[2],
        value: `${banks.length}`,
      },
      {
        ...mockDashboardOverviewSections.stats[3],
        value: `${questions.length}`,
      },
    ],
    operationalHighlights: [
      {
        id: "active-assessments",
        title: `${assessmentPage.stats.activeCount} active assessments`,
        description: "Assessments currently open and receiving participant activity.",
        icon: "activity",
      },
      {
        id: "real-time-assessments",
        title: `${assessmentPage.stats.realTimeCount} real-time assessments`,
        description: "Live sessions that need host controls, join links, and monitoring.",
        icon: "clock",
      },
      {
        id: "starting-this-week",
        title: `${assessmentPage.stats.startingThisWeekCount} starting this week`,
        description: "Assessments approaching launch that may need a final readiness check.",
        icon: "trendingUp",
      },
    ],
  };
}

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  "use cache";

  const [assessmentPage] = await Promise.all([getAssessmentCatalogPageData()]);

  return {
    ...mockDashboardAnalytics,
    recentAssessments: assessmentPage.assessments
      .slice()
      .sort(
        (left, right) =>
          new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
      )
      .slice(0, 6)
      .map((assessment) => ({
        id: assessment.id,
        title: assessment.title,
        bank: assessment.question_bank_name,
        mode: assessment.delivery_mode === "SELF_PACED" ? "Self-paced" : "Real-time",
        status: mapAssessmentStatus(assessment.lifecycle),
        questions: assessment.question_count,
        participants: assessment.participant_count,
        passRate: assessment.pass_rate,
        lastModified: formatRelativeTime(assessment.updated_at),
      })),
  };
}
