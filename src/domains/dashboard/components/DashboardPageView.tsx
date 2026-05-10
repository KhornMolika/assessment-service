import Link from "next/link";
import { Plus } from "lucide-react";
import type { AssessmentCatalogItem } from "@/src/domains/assessment/types/assessment-catalog.types";
import type {
  AssessmentTopicMap,
  Bank,
  BankTopicMap,
  QuestionCatalogItem,
  QuestionTopicMap,
  Topic,
} from "@/src/domains/content/types";
import { StateMessage } from "@/src/shared/components/feedback/StateMessage";
import { PageHeaderCard } from "@/src/shared/components/layout/PageHeaderCard";
import { Badge } from "@/src/shared/components/ui/badge";
import { ALL_TOPICS_VALUE, assessmentMatchesTopic, bankMatchesTopic, questionMatchesTopic } from "@/src/domains/content/utils/topic-utils";
import type {
  DashboardOverviewSections,
  OperationalHighlight,
  RecentAssessment,
} from "../types/dashboard.types";
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

function mapAssessmentStatus(lifecycle: string): RecentAssessment["status"] {
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
      status: mapAssessmentStatus(assessment.lifecycle),
      questions: assessment.question_count,
      participants: assessment.participant_count,
      passRate: assessment.pass_rate,
      lastModified: formatRelativeTime(assessment.updated_at, DASHBOARD_REFERENCE_DATE),
    }));
}

export default function DashboardPageView({
  quickLaunchpad,
  assessments,
  banks,
  questions,
  topics,
  assessmentTopics,
  bankTopics,
  questionTopics,
  selectedTopic,
}: {
  quickLaunchpad: DashboardOverviewSections["quickLaunchpad"];
  assessments: AssessmentCatalogItem[];
  banks: Bank[];
  questions: QuestionCatalogItem[];
  topics: Topic[];
  assessmentTopics: AssessmentTopicMap[];
  bankTopics: BankTopicMap[];
  questionTopics: QuestionTopicMap[];
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

  const filteredBanks =
    selectedTopic === ALL_TOPICS_VALUE
      ? banks
      : banks.filter((bank) => bankMatchesTopic(bank.id, selectedTopic, bankTopics));

  const filteredQuestions =
    selectedTopic === ALL_TOPICS_VALUE
      ? questions
      : questions.filter((question) =>
          questionMatchesTopic(question.id, selectedTopic, questionTopics),
        );

  const operationalHighlights = buildOperationalHighlights(filteredAssessments);
  const recentAssessments = buildRecentAssessments(filteredAssessments);

  const hasAnyVisibleContent =
    filteredAssessments.length > 0 ||
    filteredBanks.length > 0 ||
    filteredQuestions.length > 0;

  return (
    <div className="space-y-6 p-4">
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
          description={`No assessments, question banks, or questions are mapped to ${selectedTopicLabel}.`}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <OperationalHighlights items={operationalHighlights} />
            <QuickLaunchpad items={quickLaunchpad} />
          </div>

          <RecentAssessmentTable items={recentAssessments} />
        </>
      )}
    </div>
  );
}
