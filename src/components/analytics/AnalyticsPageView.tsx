"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { TrendingUp } from "lucide-react";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { PaginatedCollectionCard } from "@/src/components/ui/data/PaginatedCollectionCard";
import { Badge } from "@/src/components/ui/ui/badge";
import {
  parsePositiveInteger,
  useUrlQueryUpdater,
} from "@/src/hooks/use-url-query-state";
import { ALL_TOPICS_VALUE, assessmentMatchesTopic } from "@/src/utils/topic-utils";
import AnalyticsAssessmentTable from "./AnalyticsAssessmentTable";
import AnalyticsDistributionCard from "./AnalyticsDistributionCard";
import AnalyticsFiltersCard from "./AnalyticsFiltersCard";
import AnalyticsQuestionBreakdownCard from "./AnalyticsQuestionBreakdownCard";
import { buildAnalyticsSnapshot } from "@/src/utils/analytics.utils";
import type { AnalyticsPageViewProps } from "@/src/types/analytics.types";

export default function AnalyticsPageView({
  assessments,
  assessmentTopics,
  topics,
  answerEntries,
  answerSheets,
}: AnalyticsPageViewProps) {
  const searchParams = useSearchParams();
  const selectedTopic = searchParams.get("topic") ?? ALL_TOPICS_VALUE;
  const updateUrl = useUrlQueryUpdater();
  const selectedAssessmentId = searchParams.get("assessment") ?? "all-assessments";
  const assessmentPage = parsePositiveInteger(searchParams.get("page"), 1);
  const assessmentPageSize = parsePositiveInteger(searchParams.get("pageSize"), 5);

  const filteredAssessments = useMemo(
    () =>
      assessments.filter((assessment) =>
        selectedTopic === ALL_TOPICS_VALUE
          ? true
          : assessmentMatchesTopic(assessment.id, selectedTopic, assessmentTopics),
      ),
    [assessmentTopics, assessments, selectedTopic],
  );

  const effectiveSelectedAssessmentId = filteredAssessments.some(
    (assessment) => assessment.id === selectedAssessmentId,
  )
    ? selectedAssessmentId
    : "all-assessments";

  const snapshot = useMemo(
    () =>
      buildAnalyticsSnapshot({
        assessments,
        assessmentTopics,
        topics,
        answerEntries,
        answerSheets,
        selectedAssessmentId: effectiveSelectedAssessmentId,
        selectedTopic,
      }),
    [
      assessmentTopics,
      assessments,
      answerEntries,
      answerSheets,
      effectiveSelectedAssessmentId,
      selectedTopic,
      topics,
    ],
  );
  const assessmentTotalPages = Math.max(
    1,
    Math.ceil(snapshot.assessmentRows.length / assessmentPageSize),
  );
  const effectiveAssessmentPage = Math.min(assessmentPage, assessmentTotalPages);
  const paginatedAssessmentRows = useMemo(
    () =>
      snapshot.assessmentRows.slice(
        (effectiveAssessmentPage - 1) * assessmentPageSize,
        effectiveAssessmentPage * assessmentPageSize,
      ),
    [assessmentPageSize, effectiveAssessmentPage, snapshot.assessmentRows],
  );

  return (
    <div className="space-y-6 p-4">
      <PageHeaderCard
        title="Analytics"
        description="Monitor topic-level performance, compare assessments, and spot where participant demand or question load is concentrated."
        meta={
          <>
            <Badge variant="info">Mock data</Badge>
            <Badge variant="secondary" className="gap-1.5">
              <TrendingUp className="h-3.5 w-3.5" />
              Topic-aware analytics
            </Badge>
          </>
        }
      />

      <AnalyticsFiltersCard
        assessments={filteredAssessments}
        selectedAssessmentId={effectiveSelectedAssessmentId}
        selectedTopicLabel={snapshot.selectedTopicLabel}
        onAssessmentChange={(value) => {
          updateUrl({
            assessment: value === "all-assessments" ? null : value,
            page: null,
          });
        }}
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
        pagination={{
          currentPage: effectiveAssessmentPage,
          totalPages: assessmentTotalPages,
          pageSize: assessmentPageSize,
          totalItems: snapshot.assessmentRows.length,
          pageSizeOptions: [5, 10, 20],
          itemLabel: "assessments",
          onPageChange: (page) => updateUrl({ page: page === 1 ? null : page }),
          onPageSizeChange: (size) => {
            updateUrl({
              pageSize: size === 5 ? null : size,
              page: null,
            });
          },
        }}
      >
        <AnalyticsAssessmentTable rows={paginatedAssessmentRows} />
      </PaginatedCollectionCard>
    </div>
  );
}
