import { Suspense } from "react";
import {
  getAssessmentResultsPageData,
} from "@/src/components/assessment/api/assessment.api";
import AnalyticsAssessmentTable from "@/src/components/analytics/components/AnalyticsAssessmentTable";
import AnalyticsDistributionCard from "@/src/components/analytics/components/AnalyticsDistributionCard";
import AnalyticsFiltersControl from "@/src/components/analytics/components/AnalyticsFiltersControl";
import AnalyticsQuestionBreakdownCard from "@/src/components/analytics/components/AnalyticsQuestionBreakdownCard";
import { buildAnalyticsSnapshot } from "@/src/components/analytics/utils/analytics.utils";
import { ALL_TOPICS_VALUE, assessmentMatchesTopic } from "@/src/components/content/utils/topic-utils";
import LinkPagination from "@/src/components/ui/navigation/LinkPagination";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { PaginatedCollectionCard } from "@/src/components/ui/data/PaginatedCollectionCard";
import { AnalyticsContentSkeleton } from "@/src/components/ui/layout/PageSkeletons";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Analytics',
};

type AnalyticsSearchParams = {
  topic?: string | string[];
  assessment?: string | string[];
  page?: string | string[];
  pageSize?: string | string[];
};

function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
}

async function getAnalyticsPageSnapshot({
  selectedAssessmentId,
  selectedTopic,
}: {
  selectedAssessmentId: string;
  selectedTopic: string;
}) {
  "use cache";

  const data = await getAssessmentResultsPageData();
  const filteredAssessments = data.assessments.filter((assessment) =>
    selectedTopic === ALL_TOPICS_VALUE
      ? true
      : assessmentMatchesTopic(assessment.id, selectedTopic, data.assessment_topics),
  );
  const effectiveSelectedAssessmentId = filteredAssessments.some(
    (assessment) => assessment.id === selectedAssessmentId,
  )
    ? selectedAssessmentId
    : "all-assessments";
  const snapshot = buildAnalyticsSnapshot({
    assessments: data.assessments,
    assessmentTopics: data.assessment_topics,
    topics: data.topics,
    answerEntries: data.answer_entries,
    answerSheets: data.answer_sheets,
    selectedAssessmentId: effectiveSelectedAssessmentId,
    selectedTopic,
  });

  return {
    filteredAssessments,
    effectiveSelectedAssessmentId,
    snapshot,
  };
}

async function AnalyticsPageContent({
  searchParams,
}: {
  searchParams?: Promise<AnalyticsSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedTopic =
    getSingleSearchParam(resolvedSearchParams?.topic) ?? ALL_TOPICS_VALUE;
  const selectedAssessmentId =
    getSingleSearchParam(resolvedSearchParams?.assessment) ?? "all-assessments";
  const assessmentPage = parsePositiveInteger(
    getSingleSearchParam(resolvedSearchParams?.page),
    1,
  );
  const assessmentPageSize = parsePositiveInteger(
    getSingleSearchParam(resolvedSearchParams?.pageSize),
    5,
  );
  const {
    filteredAssessments,
    effectiveSelectedAssessmentId,
    snapshot,
  } = await getAnalyticsPageSnapshot({
    selectedAssessmentId,
    selectedTopic,
  });
  const assessmentTotalPages = Math.max(
    1,
    Math.ceil(snapshot.assessmentRows.length / assessmentPageSize),
  );
  const effectiveAssessmentPage = Math.min(assessmentPage, assessmentTotalPages);
  const paginatedAssessmentRows = snapshot.assessmentRows.slice(
    (effectiveAssessmentPage - 1) * assessmentPageSize,
    effectiveAssessmentPage * assessmentPageSize,
  );

  return (
    <>
      <AnalyticsFiltersControl
        assessments={filteredAssessments}
        selectedAssessmentId={effectiveSelectedAssessmentId}
        selectedTopicLabel={snapshot.selectedTopicLabel}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AnalyticsDistributionCard
          title="Question type coverage"
          description="Unique answered questions grouped by type for the current topic and assessment scope."
          items={snapshot.questionTypeDistribution}
          metricLabel="questions"
        />
        <AnalyticsDistributionCard
          title="Question difficulty mix"
          description="Unique answered questions grouped into hard, medium, and easy buckets for the current slice."
          items={snapshot.difficultyDistribution}
          metricLabel="questions"
        />
      </div>

      <AnalyticsQuestionBreakdownCard items={snapshot.questionBreakdown} />

      <PaginatedCollectionCard
        title="Assessment analytics breakdown"
        description="Assessment-level view of participation, question load, and published outcomes."
        isEmpty={snapshot.assessmentRows.length === 0}
        emptyState={<AnalyticsAssessmentTable rows={paginatedAssessmentRows} />}
      >
        <AnalyticsAssessmentTable rows={paginatedAssessmentRows} />
      </PaginatedCollectionCard>
      {snapshot.assessmentRows.length > 0 ? (
        <LinkPagination
          pathname="/analytics"
          searchParams={{
            topic: selectedTopic === ALL_TOPICS_VALUE ? null : selectedTopic,
            assessment:
              effectiveSelectedAssessmentId === "all-assessments"
                ? null
                : effectiveSelectedAssessmentId,
          }}
          currentPage={effectiveAssessmentPage}
          totalPages={assessmentTotalPages}
          pageSize={assessmentPageSize}
          totalItems={snapshot.assessmentRows.length}
          pageSizeOptions={[5, 10, 20]}
          itemLabel="assessments"
          defaultPageSize={5}
        />
      ) : null}
    </>
  );
}

export default function AnalyticsPage({
  searchParams,
}: {
  searchParams?: Promise<AnalyticsSearchParams>;
}) {
  return (
    <div className="space-y-6 p-4">
      <PageHeaderCard
      title="Analytics"
      description="Monitor topic-level performance, compare assessments, and spot where participant demand or question load is concentrated."
    />
      <Suspense fallback={<AnalyticsContentSkeleton />}>
        <AnalyticsPageContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
