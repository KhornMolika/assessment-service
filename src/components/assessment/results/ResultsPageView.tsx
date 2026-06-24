"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { AssessmentResultsPageData } from "@/src/types/assessment-results.types";
import { ALL_TOPICS_VALUE, assessmentMatchesTopic } from "@/src/utils/topic-utils";
import { PaginatedCollectionCard } from "@/src/components/ui/data/PaginatedCollectionCard";
import {
  parsePositiveInteger,
  useDebouncedSearchParam,
  useUrlQueryUpdater,
} from "@/src/hooks/use-url-query-state";
import { ResultsFilters } from "./ResultsFilters";
import { ResultsHeader } from "./ResultsHeader";
import { ResultsTable } from "./ResultsTable";
import { exportResultsCsv } from "./results.export";
import { buildRows } from "./results.utils";

export default function ResultsPageView({
  data,
}: {
  data: AssessmentResultsPageData;
}) {
  const searchParams = useSearchParams();
  const updateUrl = useUrlQueryUpdater();
  const { inputValue: searchQuery, setInputValue: setSearchQuery } = useDebouncedSearchParam({
    key: "query",
  });
  const [selectedAssessment, setSelectedAssessment] = useState("All Assessments");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [sortBy, setSortBy] = useState("submitted-new");
  const currentPage = parsePositiveInteger(searchParams.get("page"), 1);
  const itemsPerPage = parsePositiveInteger(searchParams.get("pageSize"), 10);
  const selectedTopic = searchParams.get("topic") ?? ALL_TOPICS_VALUE;

  const allRows = useMemo(() => buildRows(data), [data]);

  const assessmentOptions = useMemo(
    () => ["All Assessments", ...new Set(allRows.map((result) => result.assessment_title))],
    [allRows],
  );
  const filteredResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const working = allRows.filter((result) => {
      const matchesAssessment =
        selectedAssessment === "All Assessments" ||
        result.assessment_title === selectedAssessment;
      const matchesTopic =
        selectedTopic === ALL_TOPICS_VALUE ||
        assessmentMatchesTopic(result.assessment_id, selectedTopic, data.assessment_topics);
      const matchesStatus =
        selectedStatus === "All Statuses" ||
        (selectedStatus === "Pending Review" && result.evaluationStatus === "PENDING_REVIEW") ||
        (selectedStatus === "Passed" && result.outcomeStatus === "PASSED") ||
        (selectedStatus === "Failed" && result.outcomeStatus === "FAILED");
      const matchesSearch =
        normalizedQuery.length === 0 ||
        result.participant_display_name.toLowerCase().includes(normalizedQuery);

      return matchesAssessment && matchesTopic && matchesStatus && matchesSearch;
    });

    working.sort((left, right) => {
      if (sortBy === "score-high") {
        return (right.percentage ?? -1) - (left.percentage ?? -1);
      }

      if (sortBy === "score-low") {
        return (left.percentage ?? 999) - (right.percentage ?? 999);
      }

      if (sortBy === "submitted-old") {
        return new Date(left.submittedAt).getTime() - new Date(right.submittedAt).getTime();
      }

      return new Date(right.submittedAt).getTime() - new Date(left.submittedAt).getTime();
    });

    return working;
  }, [allRows, data.assessment_topics, searchQuery, selectedAssessment, selectedStatus, selectedTopic, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const currentItems = filteredResults.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage,
  );

  return (
    <div>
      <div className="w-full space-y-6">
        <ResultsHeader onExportCsv={() => exportResultsCsv(filteredResults)} />

        <div className="mt-6">
          <ResultsFilters
            assessmentOptions={assessmentOptions}
            selectedAssessment={selectedAssessment}
            selectedStatus={selectedStatus}
            searchQuery={searchQuery}
            sortBy={sortBy}
            onAssessmentChange={(value) => {
              setSelectedAssessment(value);
              updateUrl({ page: null });
            }}
            onStatusChange={(value) => {
              setSelectedStatus(value);
              updateUrl({ page: null });
            }}
            onSearchChange={setSearchQuery}
            onSortChange={(value) => {
              setSortBy(value);
              updateUrl({ page: null });
            }}
          />
        </div>

        <div className="mt-6">
          <PaginatedCollectionCard
            title="Results library"
            description="Review submissions, scores, grading status, and route into detailed answer sheets."
            className="overflow-hidden"
            contentClassName="px-0 pb-0 sm:px-0 sm:pb-0"
            bodyClassName={filteredResults.length === 0 ? "px-4 pb-4 sm:px-6 sm:pb-6" : undefined}
            isEmpty={filteredResults.length === 0}
            emptyState={<ResultsTable rows={currentItems} />}
            pagination={{
              currentPage: activePage,
              totalPages,
              pageSize: itemsPerPage,
              totalItems: filteredResults.length,
              pageSizeOptions: [5, 10, 20, 50],
              itemLabel: "results",
              onPageSizeChange: (value) => {
                updateUrl({
                  pageSize: value === 10 ? null : value,
                  page: null,
                });
              },
              onPageChange: (page) => updateUrl({ page: page === 1 ? null : page }),
            }}
          >
            <ResultsTable rows={currentItems} />
          </PaginatedCollectionCard>
        </div>
      </div>
    </div>
  );
}
