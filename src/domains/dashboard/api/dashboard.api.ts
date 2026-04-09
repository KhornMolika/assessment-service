import type {
  DashboardAnalytics,
  DashboardOverviewSections,
} from "../types/dashboard.types";

const mockDashboardOverviewSections: DashboardOverviewSections = {
  stats: [
    {
      id: "active-assessments",
      label: "Active Assessments",
      value: "10",
      helper: "Assessments currently open and accepting responses.",
      icon: "radio",
      tone: "accent",
    },
    {
      id: "total-assessments",
      label: "Total Assessments",
      value: "20",
      helper: "All assessments created, including active and completed.",
      icon: "clipboardList",
    },
    {
      id: "total-questions",
      label: "Total Questions",
      value: "350",
      helper: "Reusable questions available across all assessments.",
      icon: "helpCircle",
      tone: "success",
    },
    {
      id: "question-banks",
      label: "Question Banks",
      value: "10",
      helper: "Organized collections used to group and manage questions.",
      icon: "library",
      tone: "warning",
    },
  ],
  operationalHighlights: [
    {
      id: "pending-manual-gradings",
      title: "14 pending manual gradings",
      description: "Essay and file-upload responses are waiting for review.",
      icon: "clock",
    },
    {
      id: "live-sessions",
      title: "1 live session in progress",
      description:
        "Host controls and answer reveal timing are available from the sessions area.",
      icon: "activity",
    },
    {
      id: "completed-this-month",
      title: "28 completed assessments this month",
      description:
        "Reports are ready to export for leadership and compliance reviews.",
      icon: "trendingUp",
    },
  ],
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
  recentAssessments: [
    {
      id: 1,
      title: "Final Exam - Mathematics Grade 11",
      bank: "Mathematics",
      mode: "Self-paced",
      status: "Published",
      questions: 40,
      participants: 243,
      passRate: "73%",
      lastModified: "2 hours ago",
    },
    {
      id: 2,
      title: "Tech Risk Assessment - TechCorp Q4",
      bank: "Tech Risk",
      mode: "Self-paced",
      status: "Active",
      questions: 22,
      participants: 23,
      passRate: "68%",
      lastModified: "5 hours ago",
    },
    {
      id: 3,
      title: "Employee Onboarding Survey",
      bank: "Survey",
      mode: "Self-paced",
      status: "Completed",
      questions: 18,
      participants: 15,
      passRate: "-",
      lastModified: "1 day ago",
    },
    {
      id: 4,
      title: "Chemistry Quiz - Chapter 4",
      bank: "Chemistry",
      mode: "Scheduled",
      status: "Scheduled",
      questions: 30,
      participants: 0,
      passRate: "-",
      lastModified: "2 days ago",
    },
    {
      id: 5,
      title: "Annual Security Awareness Test",
      bank: "Security",
      mode: "Self-paced",
      status: "Completed",
      questions: 25,
      participants: 187,
      passRate: "92%",
      lastModified: "3 days ago",
    },
    {
      id: 6,
      title: "Live Product Knowledge Quiz",
      bank: "Product",
      mode: "Real-time",
      status: "Pending",
      questions: 15,
      participants: 0,
      passRate: "-",
      lastModified: "4 days ago",
    },
  ],
};

export async function getDashboardOverviewSections(): Promise<DashboardOverviewSections> {
  return mockDashboardOverviewSections;
}

export async function getDashboardAnalytics(): Promise<DashboardAnalytics> {
  return mockDashboardAnalytics;
}
