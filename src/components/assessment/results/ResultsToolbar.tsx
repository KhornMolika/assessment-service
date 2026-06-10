"use client";

import {
  useDebouncedSearchParam,
  useUrlQueryUpdater,
} from "@/src/hooks/use-url-query-state";
import { ResultsFilters } from "./ResultsFilters";

export default function ResultsToolbar({
  assessmentOptions,
  selectedAssessment,
  selectedStatus,
  sortBy,
}: {
  assessmentOptions: string[];
  selectedAssessment: string;
  selectedStatus: string;
  sortBy: string;
}) {
  const updateUrl = useUrlQueryUpdater();
  const { inputValue: searchQuery, setInputValue: setSearchQuery } =
    useDebouncedSearchParam({
      key: "query",
    });

  return (
    <ResultsFilters
      assessmentOptions={assessmentOptions}
      selectedAssessment={selectedAssessment}
      selectedStatus={selectedStatus}
      searchQuery={searchQuery}
      sortBy={sortBy}
      onAssessmentChange={(value) => {
        updateUrl({
          assessment: value === "All Assessments" ? null : value,
          page: null,
        });
      }}
      onStatusChange={(value) => {
        updateUrl({
          status: value === "All Statuses" ? null : value,
          page: null,
        });
      }}
      onSearchChange={setSearchQuery}
      onSortChange={(value) => {
        updateUrl({
          sort: value === "submitted-new" ? null : value,
          page: null,
        });
      }}
    />
  );
}
