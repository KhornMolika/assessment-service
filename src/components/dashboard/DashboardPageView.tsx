import Link from "next/link";
import { Plus } from "lucide-react";
import type { AssessmentCatalogItem } from "@/src/types/assessment-catalog.types";
import type {
  AssessmentTopicMap,
  Topic,
} from "@/src/types";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { Badge } from "@/src/components/ui/ui/badge";
import { ALL_TOPICS_VALUE, assessmentMatchesTopic } from "@/src/utils/topic-utils";
import type {
  OperationalHighlight,
  RecentAssessment,
} from "@/src/types/dashboard.types";
import OperationalHighlights from "./OperationalHighlights";
import QuickLaunchpad from "./QuickLaunchpad";
import RecentAssessmentTable from "./RecentAssessmentTable";

const DASHBOARD_REFERENCE_DATE = new Date("2026-04-30T00:00:00.000Z");

function formatRelativeTime(dateString: string, referenceDate: Date) {
  const value = new Date(dateString);
  const diffMs = referenceDate.getTime() - value.getTime();
  const diffHours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));

  if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  }

  const diffDays = Math.max(1, Math.round(diffHours / 24));
  return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;
}

function mapDashboardAssessmentStatus(lifecycle: string): RecentAssessment["status"] {
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

function getStartOfWeek(date: Date) {
  const startOfWeek = new Date(date);
  const day = startOfWeek.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  startOfWeek.setDate(startOfWeek.getDate() + diff);
  startOfWeek.setHours(0, 0, 0, 0);

  return startOfWeek;
}

function getEndOfWeek(date: Date) {
  const endOfWeek = getStartOfWeek(date);
  endOfWeek.setDate(endOfWeek.getDate() + 7);
  return endOfWeek;
}

function buildOperationalHighlights(
  filteredAssessments: AssessmentCatalogItem[],
): OperationalHighlight[] {
  const startOfWeek = getStartOfWeek(DASHBOARD_REFERENCE_DATE);
  const endOfWeek = getEndOfWeek(DASHBOARD_REFERENCE_DATE);

  return [
    {
      id: "active-assessments",
      title: `${filteredAssessments.filter((assessment) => assessment.lifecycle === "ACTIVE").length} active assessments`,
      description: "Assessments currently open and receiving participant activity.",
      icon: "activity",
    },
    {
      id: "real-time-assessments",
      title: `${filteredAssessments.filter((assessment) => assessment.delivery_mode === "REAL_TIME").length} real-time assessments`,
      description: "Live sessions that need host controls, join links, and monitoring.",
      icon: "clock",
    },
    {
      id: "starting-this-week",
      title: `${filteredAssessments.filter((assessment) => {
        const startsAt = new Date(assessment.starts_at);
        return startsAt >= startOfWeek && startsAt < endOfWeek;
      }).length} starting this week`,
      description: "Assessments approaching launch that may need a final readiness check.",
      icon: "trendingUp",
    },
  ];
}

function buildRecentAssessments(filteredAssessments: AssessmentCatalogItem[]): RecentAssessment[] {
  return filteredAssessments
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
      status: mapDashboardAssessmentStatus(assessment.lifecycle),
      questions: assessment.question_count,
      participants: assessment.participant_count,
      passRate: assessment.pass_rate,
      lastModified: formatRelativeTime(assessment.updated_at, DASHBOARD_REFERENCE_DATE),
    }));
}

const QUICK_LAUNCHPAD_ITEMS: any[] = [
  {
    id: "question-banks",
    href: "/question-banks",
    title: "Maintain question banks",
    description: "Curate reusable questions and taxonomy.",
    icon: "library"
  },
  {
    id: "assessments",
    href: "/assessments",
    title: "Manage assessments",
    description: "Track draft, active, and completed delivery flows.",
    icon: "clipboardList"
  },
  {
    id: "sessions",
    href: "/sessions",
    title: "Monitor sessions",
    description: "Share join codes, host live quizzes, and review outcomes.",
    icon: "radio"
  }
];

export default function DashboardPageView({
  assessments,
  topics,
  assessmentTopics,
  selectedTopic,
}: {
  assessments: AssessmentCatalogItem[];
  topics: Topic[];
  assessmentTopics: AssessmentTopicMap[];
  selectedTopic: string;
}) {
  const selectedTopicLabel =
    selectedTopic === ALL_TOPICS_VALUE
      ? "All Topics"
      : topics.find((topic) => topic.id === selectedTopic)?.name ?? "Unknown Topic";

  const filteredAssessments =
    selectedTopic === ALL_TOPICS_VALUE
      ? assessments
      : assessments.filter((assessment) =>
          assessmentMatchesTopic(assessment.id, selectedTopic, assessmentTopics),
        );

  const operationalHighlights = buildOperationalHighlights(filteredAssessments);
  const recentAssessments = buildRecentAssessments(filteredAssessments);

  const hasAnyVisibleContent = filteredAssessments.length > 0;

  return (
    <div className="space-y-6">
      <PageHeaderCard
        title="Dashboard"
        description={`Focus on the current workspace footprint, pending operational work, and the latest assessment activity for ${selectedTopicLabel.toLowerCase()}.`}
        meta={<Badge variant="secondary">{selectedTopicLabel}</Badge>}
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

      {!hasAnyVisibleContent ? (
        <StateMessage
          title="No dashboard data found"
          description={`No assessments are mapped to ${selectedTopicLabel}.`}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <OperationalHighlights items={operationalHighlights} />
            <QuickLaunchpad items={QUICK_LAUNCHPAD_ITEMS} />
          </div>

          <RecentAssessmentTable items={recentAssessments} />
        </>
      )}
    </div>
  );
}
