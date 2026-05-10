"use client";

import type { AssessmentCatalogItem } from "@/src/domains/assessment/types/assessment-catalog.types";
import { useUrlQueryUpdater } from "@/src/shared/hooks/use-url-query-state";
import AnalyticsFiltersCard from "./AnalyticsFiltersCard";

export default function AnalyticsFiltersControl({
  assessments,
  selectedAssessmentId,
  selectedTopicLabel,
}: {
  assessments: AssessmentCatalogItem[];
  selectedAssessmentId: string;
  selectedTopicLabel: string;
}) {
  const updateUrl = useUrlQueryUpdater();

  return (
    <AnalyticsFiltersCard
      assessments={assessments}
      selectedAssessmentId={selectedAssessmentId}
      selectedTopicLabel={selectedTopicLabel}
      onAssessmentChange={(value) => {
        updateUrl({
          assessment: value === "all-assessments" ? null : value,
          page: null,
        });
      }}
    />
  );
}
