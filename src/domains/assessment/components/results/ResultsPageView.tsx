"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { AssessmentResultsPageData } from "@/src/domains/assessment/types/assessment-results.types";
import { ALL_TOPICS_VALUE, assessmentMatchesTopic } from "@/src/domains/content/utils/topic-utils";
import { ResultsFilters } from "./ResultsFilters";
import { ResultsHeader } from "./ResultsHeader";
import { ResultsPagination } from "./ResultsPagination";
import { ResultsStats } from "./ResultsStats";
import { ResultsTable } from "./ResultsTable";
import { exportResultsCsv } from "./results.export";
import { buildRows, buildStatsFromRows } from "./results.utils";

export default function ResultsPageView({
  data,
}: {
  data: AssessmentResultsPageData;
}) {
  const searchParams = useSearchParams();
  const [selectedAssessment, setSelectedAssessment] = useState("All Assessments");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("submitted-new");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const selectedTopic = searchParams.get("topic") ?? ALL_TOPICS_VALUE;

  const allRows = useMemo(() => buildRows(data), [data]);

  const assessmentOptions = useMemo(
    () => ["All Assessments", ...new Set(allRows.map((result) => result.assessment_title))],
    [allRows],
  );
  const selectedAssessmentRows = useMemo(
    () =>
      selectedAssessment === "All Assessments"
        ? allRows
        : allRows.filter((result) => result.assessment_title === selectedAssessment),
    [allRows, selectedAssessment],
  );
  const selectedAssessmentStats = useMemo(
    () =>
      selectedAssessment === "All Assessments"
        ? data.stats
        : buildStatsFromRows(selectedAssessmentRows),
    [data.stats, selectedAssessment, selectedAssessmentRows],
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
  const currentItems = filteredResults.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        <ResultsHeader onExportCsv={() => exportResultsCsv(filteredResults)} />

        <div className="mt-6">
          <ResultsStats stats={selectedAssessmentStats} />
        </div>

        <div className="mt-6">
          <ResultsFilters
            assessmentOptions={assessmentOptions}
            selectedAssessment={selectedAssessment}
            selectedStatus={selectedStatus}
            searchQuery={searchQuery}
            sortBy={sortBy}
            onAssessmentChange={(value) => {
              setSelectedAssessment(value);
              setCurrentPage(1);
            }}
            onStatusChange={(value) => {
              setSelectedStatus(value);
              setCurrentPage(1);
            }}
            onSearchChange={(value) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            onSortChange={(value) => {
              setSortBy(value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="mt-6">
          <ResultsTable rows={currentItems} />
        </div>

        <div className="mt-6">
          <ResultsPagination
            itemsPerPage={itemsPerPage}
            totalItems={filteredResults.length}
            totalPages={totalPages}
            currentPage={currentPage}
            onItemsPerPageChange={(value) => {
              setItemsPerPage(value);
              setCurrentPage(1);
            }}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
