"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
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
  DashboardStat,
  OperationalHighlight,
  RecentAssessment,
} from "../types/dashboard.types";
import OperationalHighlights from "./OperationalHighlights";
import QuickLaunchpad from "./QuickLaunchpad";
import RecentAssessmentTable from "./RecentAssessmentTable";
import StatsGridSection from "./StatsGridSection";

function formatRelativeTime(dateString: string) {
  const now = new Date();
  const value = new Date(dateString);
  const diffMs = now.getTime() - value.getTime();
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

function buildStats({
  topics,
  filteredAssessments,
  filteredBanks,
  filteredQuestions,
  selectedTopic,
}: {
  topics: Topic[];
  filteredAssessments: AssessmentCatalogItem[];
  filteredBanks: Bank[];
  filteredQuestions: QuestionCatalogItem[];
  selectedTopic: string;
}): DashboardStat[] {
  const hasFilteredContent =
    filteredAssessments.length > 0 ||
    filteredBanks.length > 0 ||
    filteredQuestions.length > 0;
  const topicCount =
    selectedTopic === ALL_TOPICS_VALUE ? topics.length : hasFilteredContent ? 1 : 0;

  return [
    {
      id: "total-topics",
      label: "Total Topics",
      value: `${topicCount}`,
      helper:
        selectedTopic === ALL_TOPICS_VALUE
          ? "Shared taxonomy topics used across questions, banks, and assessments."
          : "The currently selected topic scope applied across the dashboard.",
      icon: "radio",
    },
    {
      id: "total-assessments",
      label: "Total Assessments",
      value: `${filteredAssessments.length}`,
      helper: "Assessments currently visible in the selected topic scope.",
      icon: "clipboardList",
      tone: "accent",
    },
    {
      id: "question-banks",
      label: "Question Banks",
      value: `${filteredBanks.length}`,
      helper: "Question banks mapped to the current topic scope.",
      icon: "library",
      tone: "warning",
    },
    {
      id: "total-questions",
      label: "Total Questions",
      value: `${filteredQuestions.length}`,
      helper: "Reusable questions mapped to the current topic scope.",
      icon: "helpCircle",
      tone: "success",
    },
  ];
}

function buildOperationalHighlights(filteredAssessments: AssessmentCatalogItem[]): OperationalHighlight[] {
  const now = new Date();
  const startOfWeek = getStartOfWeek(now);
  const endOfWeek = getEndOfWeek(now);

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
      lastModified: formatRelativeTime(assessment.updated_at),
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
}: {
  quickLaunchpad: DashboardOverviewSections["quickLaunchpad"];
  assessments: AssessmentCatalogItem[];
  banks: Bank[];
  questions: QuestionCatalogItem[];
  topics: Topic[];
  assessmentTopics: AssessmentTopicMap[];
  bankTopics: BankTopicMap[];
  questionTopics: QuestionTopicMap[];
}) {
  const searchParams = useSearchParams();
  const selectedTopic = searchParams.get("topic") ?? ALL_TOPICS_VALUE;
  const selectedTopicLabel =
    selectedTopic === ALL_TOPICS_VALUE
      ? "All Topics"
      : topics.find((topic) => topic.id === selectedTopic)?.name ?? "Unknown Topic";

  const filteredAssessments = useMemo(
    () =>
      selectedTopic === ALL_TOPICS_VALUE
        ? assessments
        : assessments.filter((assessment) =>
            assessmentMatchesTopic(assessment.id, selectedTopic, assessmentTopics),
          ),
    [assessmentTopics, assessments, selectedTopic],
  );

  const filteredBanks = useMemo(
    () =>
      selectedTopic === ALL_TOPICS_VALUE
        ? banks
        : banks.filter((bank) => bankMatchesTopic(bank.id, selectedTopic, bankTopics)),
    [bankTopics, banks, selectedTopic],
  );

  const filteredQuestions = useMemo(
    () =>
      selectedTopic === ALL_TOPICS_VALUE
        ? questions
        : questions.filter((question) =>
            questionMatchesTopic(question.id, selectedTopic, questionTopics),
          ),
    [questionTopics, questions, selectedTopic],
  );

  const stats = useMemo(
    () =>
      buildStats({
        topics,
        filteredAssessments,
        filteredBanks,
        filteredQuestions,
        selectedTopic,
      }),
    [filteredAssessments, filteredBanks, filteredQuestions, selectedTopic, topics],
  );

  const operationalHighlights = useMemo(
    () => buildOperationalHighlights(filteredAssessments),
    [filteredAssessments],
  );

  const recentAssessments = useMemo(
    () => buildRecentAssessments(filteredAssessments),
    [filteredAssessments],
  );

  const hasAnyVisibleContent =
    filteredAssessments.length > 0 ||
    filteredBanks.length > 0 ||
    filteredQuestions.length > 0;

  return (
    <div className="space-y-6 bg-[linear-gradient(180deg,#F7FAF8_0%,#FFFFFF_30%,#F6FAF7_100%)] p-4">
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
          <StatsGridSection items={stats} />

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
