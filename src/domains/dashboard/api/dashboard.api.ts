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

const DASHBOARD_REFERENCE_TIMESTAMP = Date.UTC(2026, 3, 30, 0, 0, 0);

const mockDashboardOverviewSections: DashboardOverviewSections = {
  stats: [
    {
      id: "total-topics",
      label: "Total Topics",
      value: "0",
      helper: "Shared taxonomy topics used across questions, banks, and assessments.",
      icon: "radio",
    },
    {
      id: "total-assessments",
      label: "Total Assessments",
      value: "0",
      helper: "All assessments currently available in the workspace.",
      icon: "clipboardList",
      tone: "accent",
    },
    {
      id: "question-banks",
      label: "Question Banks",
      value: "0",
      helper: "Organized collections used to group and manage questions.",
      icon: "library",
      tone: "warning",
    },
    {
      id: "total-questions",
      label: "Total Questions",
      value: "0",
      helper: "Reusable questions available across all banks and assessments.",
      icon: "helpCircle",
      tone: "success",
    },
  ],
  operationalHighlights: [],
  quickLaunchpad: [
    {
      id: "question-banks",
      href: "/question-banks",
      title: "Maintain question banks",
      description: "Curate reusable questions and taxonomy.",
      icon: "library",
    },
    {
      id: "assessments",
      href: "/assessments",
      title: "Manage assessments",
      description: "Track draft, active, and completed delivery flows.",
      icon: "clipboardList",
    },
    {
      id: "sessions",
      href: "/sessions",
      title: "Monitor sessions",
      description: "Share join codes, host live quizzes, and review outcomes.",
      icon: "radio",
    },
  ],
  creatorSnapshot: [
    {
      id: "published-assessments",
      label: "Published assessments",
      value: "12",
    },
    { id: "question-banks", label: "Question banks", value: "9" },
    { id: "live-rooms", label: "Live rooms", value: "1" },
    { id: "active-sessions", label: "Active sessions", value: "3" },
    { id: "completion-rate", label: "Completion rate", value: "87.4%" },
  ],
};

const mockDashboardAnalytics: DashboardAnalytics = {
  sessionActivity: [
    { id: "session-1", date: "Nov 10", sessions: 42, participants: 180 },
    { id: "session-2", date: "Nov 17", sessions: 58, participants: 240 },
    { id: "session-3", date: "Nov 24", sessions: 71, participants: 320 },
    { id: "session-4", date: "Dec 1", sessions: 89, participants: 410 },
    { id: "session-5", date: "Dec 8", sessions: 103, participants: 480 },
    { id: "session-6", date: "Dec 15", sessions: 87, participants: 390 },
    { id: "session-7", date: "Dec 22", sessions: 62, participants: 280 },
  ],
  scoreDistribution: [
    { id: "dist-1", range: "0-20", count: 12 },
    { id: "dist-2", range: "21-40", count: 28 },
    { id: "dist-3", range: "41-60", count: 45 },
    { id: "dist-4", range: "61-80", count: 89 },
    { id: "dist-5", range: "81-100", count: 98 },
  ],
  recentAssessments: [],
};

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
