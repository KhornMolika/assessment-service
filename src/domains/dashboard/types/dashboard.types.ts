export type DashboardHighlightIcon = "clock" | "activity" | "trendingUp";

export type DashboardLaunchpadIcon = "library" | "clipboardList" | "radio";

export type DashboardStatIcon = "radio" | "clipboardList" | "helpCircle" | "library";

export type DashboardStatTone = "accent" | "success" | "warning";

export interface DashboardStat {
  id: string;
  label: string;
  value: string;
  helper: string;
  icon: DashboardStatIcon;
  tone?: DashboardStatTone;
}

export interface OperationalHighlight {
  id: string;
  title: string;
  description: string;
  icon: DashboardHighlightIcon;
}

export interface QuickLaunchpadItem {
  id: string;
  href: string;
  title: string;
  description: string;
  icon: DashboardLaunchpadIcon;
}

export interface CreatorSnapshotItem {
  id: string;
  label: string;
  value: string;
}

export interface DashboardOverviewSections {
  stats: DashboardStat[];
  operationalHighlights: OperationalHighlight[];
  quickLaunchpad: QuickLaunchpadItem[];
  creatorSnapshot: CreatorSnapshotItem[];
}

export interface SessionActivityPoint {
  id: string;
  date: string;
  sessions: number;
  participants: number;
}

export interface ScoreDistributionPoint {
  id: string;
  range: string;
  count: number;
}

export type AssessmentStatus =
  | "Published"
  | "Active"
  | "Completed"
  | "Scheduled"
  | "Pending";

export interface RecentAssessment {
  id: string;
  title: string;
  bank: string;
  mode: string;
  status: AssessmentStatus;
  questions: number;
  participants: number;
  passRate: string;
  lastModified: string;
}

export interface DashboardAnalytics {
  sessionActivity: SessionActivityPoint[];
  scoreDistribution: ScoreDistributionPoint[];
  recentAssessments: RecentAssessment[];
}
