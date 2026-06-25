import { Suspense } from "react";
import type { Metadata } from "next";
import { getAssessmentResultsPageData } from "@/src/api/assessment.api";
import ResultsExportButton from "@/src/components/assessment/results/ResultsExportButton";
import ResultsToolbar from "@/src/components/assessment/results/ResultsToolbar";
import { ResultsTable } from "@/src/components/assessment/results/ResultsTable";
import { buildRows } from "@/src/components/assessment/results/results.utils";
import { ALL_TOPICS_VALUE, assessmentMatchesTopic } from "@/src/utils/topic-utils";
import Pagination from "@/src/components/ui/navigation/Pagination";
import { PaginatedCollectionCard } from "@/src/components/ui/data/PaginatedCollectionCard";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { ResultsContentSkeleton } from "@/src/components/ui/layout/PageSkeletons";

export const metadata: Metadata = {
  title: "Results",
  description: "Cross-assessment submission records, scoring outcomes, and manual review status.",
};

type ResultsSearchParams = {
  topic?: string | string[];
  query?: string | string[];
  page?: string | string[];
  pageSize?: string | string[];
  assessment?: string | string[];
  status?: string | string[];
  sort?: string | string[];
};

function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed;
}

async function ResultsPageContent({
  searchParams,
}: {
  searchParams?: Promise<ResultsSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedTopic =
    getSingleSearchParam(resolvedSearchParams?.topic) ?? ALL_TOPICS_VALUE;
  const searchQuery = getSingleSearchParam(resolvedSearchParams?.query) ?? "";
  const selectedAssessment =
    getSingleSearchParam(resolvedSearchParams?.assessment) ?? "All Assessments";
  const selectedStatus =
    getSingleSearchParam(resolvedSearchParams?.status) ?? "All Statuses";
  const sortBy = getSingleSearchParam(resolvedSearchParams?.sort) ?? "submitted-new";
  const currentPage = parsePositiveInteger(
    getSingleSearchParam(resolvedSearchParams?.page),
    1,
  );
  const itemsPerPage = parsePositiveInteger(
    getSingleSearchParam(resolvedSearchParams?.pageSize),
    10,
  );
  const data = await getAssessmentResultsPageData();
  const allRows = buildRows(data);
  const assessmentOptions = [
    "All Assessments",
    ...new Set(allRows.map((result) => result.assessmentTitle)),
  ];
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredResults = allRows
    .filter((result) => {
      const matchesAssessment =
        selectedAssessment === "All Assessments" ||
        result.assessmentTitle === selectedAssessment;
      const matchesTopic =
        selectedTopic === ALL_TOPICS_VALUE ||
        assessmentMatchesTopic(result.assessmentId, selectedTopic, data.assessmentTopics);
      const matchesStatus =
        selectedStatus === "All Statuses" ||
        (selectedStatus === "Pending Review" &&
          result.evaluationStatus === "PENDING_REVIEW") ||
        (selectedStatus === "Passed" && result.outcomeStatus === "PASSED") ||
        (selectedStatus === "Failed" && result.outcomeStatus === "FAILED");
      const matchesSearch =
        normalizedQuery.length === 0 ||
        result.participantDisplayName.toLowerCase().includes(normalizedQuery);

      return matchesAssessment && matchesTopic && matchesStatus && matchesSearch;
    })
    .sort((left, right) => {
      if (sortBy === "score-high") {
        return (right.percentage ?? -1) - (left.percentage ?? -1);
      }

      if (sortBy === "score-low") {
        return (left.percentage ?? 999) - (right.percentage ?? 999);
      }

      if (sortBy === "submitted-old") {
        return (
          new Date(left.submittedAt).getTime() -
          new Date(right.submittedAt).getTime()
        );
      }

      return (
        new Date(right.submittedAt).getTime() -
        new Date(left.submittedAt).getTime()
      );
    });
  const totalPages = Math.max(1, Math.ceil(filteredResults.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const currentItems = filteredResults.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage,
  );

  return (
    <>
        <div className="mt-6">
          <ResultsToolbar
            assessmentOptions={assessmentOptions}
            selectedAssessment={selectedAssessment}
            selectedStatus={selectedStatus}
            sortBy={sortBy}
          />
        </div>

        <div className="mt-6">
          <PaginatedCollectionCard
            title="Results library"
            description="Review submissions, scores, grading status, and route into detailed answer sheets."
            className="overflow-hidden"
            contentClassName="px-0 pb-0 sm:px-0 sm:pb-0"
            bodyClassName={
              filteredResults.length === 0 ? "px-4 pb-4 sm:px-6 sm:pb-6" : undefined
            }
            isEmpty={filteredResults.length === 0}
            emptyState={<ResultsTable rows={currentItems} />}
          >
            <ResultsTable rows={currentItems} />
          </PaginatedCollectionCard>
          {filteredResults.length > 0 ? (
          <Pagination
            pathname="/results"
            searchParams={{
              topic: selectedTopic === ALL_TOPICS_VALUE ? null : selectedTopic,
              query: searchQuery || null,
              assessment: selectedAssessment === "All Assessments" ? null : selectedAssessment,
              status: selectedStatus === "All Statuses" ? null : selectedStatus,
              sort: sortBy === "submitted-new" ? null : sortBy,
              pageSize: itemsPerPage === 10 ? null : String(itemsPerPage),
            }}
            currentPage={activePage}
            totalPages={totalPages}
            pageSize={itemsPerPage}
            defaultPageSize={10}
            totalItems={filteredResults.length}
            pageSizeOptions={[5, 10, 20, 50]}
            itemLabel="results"
          />
        ) : null}
        </div>
    </>
  );
}

async function ResultsHeaderAction({
  searchParams,
}: {
  searchParams?: Promise<ResultsSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedTopic =
    getSingleSearchParam(resolvedSearchParams?.topic) ?? ALL_TOPICS_VALUE;
  const searchQuery = getSingleSearchParam(resolvedSearchParams?.query) ?? "";
  const selectedAssessment =
    getSingleSearchParam(resolvedSearchParams?.assessment) ?? "All Assessments";
  const selectedStatus =
    getSingleSearchParam(resolvedSearchParams?.status) ?? "All Statuses";
  const sortBy = getSingleSearchParam(resolvedSearchParams?.sort) ?? "submitted-new";
  const data = await getAssessmentResultsPageData();
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const rows = buildRows(data)
    .filter((result) => {
      const matchesAssessment =
        selectedAssessment === "All Assessments" ||
        result.assessmentTitle === selectedAssessment;
      const matchesTopic =
        selectedTopic === ALL_TOPICS_VALUE ||
        assessmentMatchesTopic(result.assessmentId, selectedTopic, data.assessmentTopics);
      const matchesStatus =
        selectedStatus === "All Statuses" ||
        (selectedStatus === "Pending Review" &&
          result.evaluationStatus === "PENDING_REVIEW") ||
        (selectedStatus === "Passed" && result.outcomeStatus === "PASSED") ||
        (selectedStatus === "Failed" && result.outcomeStatus === "FAILED");
      const matchesSearch =
        normalizedQuery.length === 0 ||
        result.participantDisplayName.toLowerCase().includes(normalizedQuery);

      return matchesAssessment && matchesTopic && matchesStatus && matchesSearch;
    })
    .sort((left, right) => {
      if (sortBy === "score-high") {
        return (right.percentage ?? -1) - (left.percentage ?? -1);
      }

      if (sortBy === "score-low") {
        return (left.percentage ?? 999) - (right.percentage ?? 999);
      }

      if (sortBy === "submitted-old") {
        return (
          new Date(left.submittedAt).getTime() -
          new Date(right.submittedAt).getTime()
        );
      }

      return (
        new Date(right.submittedAt).getTime() -
        new Date(left.submittedAt).getTime()
      );
    });

  return <ResultsExportButton rows={rows} />;
}

function ResultsHeader({
  searchParams,
}: {
  searchParams?: Promise<ResultsSearchParams>;
}) {
  return (
    <PageHeaderCard
      title="Results"
      description="Cross-assessment answer-sheet records, grading state, and submission outcomes."
      actions={
        <Suspense
          fallback={<div className="h-10 w-32 rounded-lg bg-muted" aria-hidden="true" />}
        >
          <ResultsHeaderAction searchParams={searchParams} />
        </Suspense>
      }
    />
  );
}

export default function ResultsPage({
  searchParams,
}: {
  searchParams?: Promise<ResultsSearchParams>;
}) {
  return (
    <div>
      <div className="space-y-6">
        <ResultsHeader searchParams={searchParams} />
        <div className="mt-6">
          <Suspense fallback={<ResultsContentSkeleton />}>
            <ResultsPageContent searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
