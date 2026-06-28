"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { AssessmentDeliveryMode } from "@/src/types/assessment.types";
import type {
  AssessmentCatalogItem,
  AssessmentCatalogStats,
} from "@/src/types/assessment-catalog.types";
import type { AssessmentTopicMap } from "@/src/types/topic.types";
import { assessmentMatchesTopic } from "@/src/utils/topic-utils";
import { ALL_TOPICS_VALUE } from "@/src/utils/topic-utils";
import {
  parsePositiveInteger,
  useDebouncedSearchParam,
  useUrlQueryUpdater,
} from "@/src/hooks/use-url-query-state";
import { PaginatedCollectionCard } from "@/src/components/ui/data/PaginatedCollectionCard";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import AssessmentsHeader from "./AssessmentsHeader";
import AssessmentsTable from "./AssessmentsTable";
import { Button } from "@/src/components/ui/ui/button";
import { Input } from "@/src/components/ui/ui/input";

const deliveryFilters: Array<{
  label: string;
  value: "ALL" | AssessmentDeliveryMode;
}> = [
  { label: "All", value: "ALL" },
  { label: "Self-paced", value: "SELF_PACED" },
  { label: "Real-time", value: "REAL_TIME" },
];

export default function AssessmentsCatalog({
  assessments,
  stats,
  assessmentTopics,
}: {
  assessments: AssessmentCatalogItem[];
  stats: AssessmentCatalogStats;
  assessmentTopics: AssessmentTopicMap[];
}) {
  const searchParams = useSearchParams();
  const updateUrl = useUrlQueryUpdater();
  const { inputValue: searchQuery, setInputValue: setSearchQuery } = useDebouncedSearchParam({
    key: "query",
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [catalogAssessments, setCatalogAssessments] = useState(assessments);
  const [deliveryFilter, setDeliveryFilter] = useState<
    "ALL" | AssessmentDeliveryMode
  >("ALL");
  const currentPage = parsePositiveInteger(searchParams.get("page"), 1);
  const itemsPerPage = parsePositiveInteger(searchParams.get("pageSize"), 10);
  const topicFilter = searchParams.get("topic") ?? ALL_TOPICS_VALUE;

  const filteredAssessments = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return catalogAssessments.filter((assessment) => {
      if (
        deliveryFilter !== "ALL" &&
        assessment.settings?.mode !== deliveryFilter
      ) {
        return false;
      }

      if (
        topicFilter !== ALL_TOPICS_VALUE &&
        !assessmentMatchesTopic(assessment.id, topicFilter, assessmentTopics)
      ) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      const haystacks = [
        assessment.name,
        assessment.description,
      ].filter(Boolean) as string[];

      return haystacks.some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      );
    });
  }, [assessmentTopics, catalogAssessments, deliveryFilter, searchQuery, topicFilter]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAssessments.length / itemsPerPage),
  );
  const activePage = Math.min(currentPage, totalPages);
  const paginatedAssessments = filteredAssessments.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage,
  );

  const handlePageSizeChange = (pageSize: number) => {
    updateUrl({
      pageSize: pageSize === 10 ? null : pageSize,
      page: null,
    });
  };

  const hasActiveFilters =
    searchQuery.trim().length > 0 ||
    topicFilter !== ALL_TOPICS_VALUE ||
    deliveryFilter !== "ALL";

  return (
    <div className="w-full space-y-6">
      <AssessmentsHeader totalAssessments={stats.totalAssessments} />

      <PaginatedCollectionCard
        title="Assessment catalog"
        description="Track readiness, delivery mode, and performance signals across the workspace."
        className="overflow-hidden"
        toolbar={
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-inkl" />
              <Input
                type="text"
                placeholder="Search assessments by title, bank, or description..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-lg border border-border bg-card py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-pm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {deliveryFilters.map((filter) => {
                const isActive = filter.value === deliveryFilter;

                return (
                  <Button
                    key={filter.value}
                    type="button"
                    onClick={() => {
                      setDeliveryFilter(filter.value);
                      updateUrl({ page: null });
                    }}
                    className={`inline-flex items-center rounded-lg border px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-card text-primary hover:bg-muted"
                    }`}
                  >
                    {filter.label}
                  </Button>
                );
              })}
            </div>
          </div>
        }
        isEmpty={filteredAssessments.length === 0}
        emptyState={
          <StateMessage
            title={hasActiveFilters ? "No assessments found" : "No assessments available"}
            description={
              hasActiveFilters
                ? "No assessments match the current search, topic, and delivery filters."
                : "Assessment records will appear here once they are available in the workspace."
            }
            action={
              hasActiveFilters ? (
                <Button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setDeliveryFilter("ALL");
                    updateUrl({
                      page: null,
                      query: null,
                      topic: null,
                    });
                  }}
                  className="inline-flex items-center justify-center rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted" variant="secondary"
                >
                  Clear filters
                </Button>
              ) : null
            }
          />
        }
        pagination={{
          currentPage: activePage,
          totalPages,
          pageSize: itemsPerPage,
          totalItems: filteredAssessments.length,
          pageSizeOptions: [5, 10, 20, 50],
          itemLabel: "assessments",
          onPageChange: (page) => updateUrl({ page: page === 1 ? null : page }),
          onPageSizeChange: handlePageSizeChange,
        }}
      >
        <AssessmentsTable
          assessments={paginatedAssessments}
        />
      </PaginatedCollectionCard>
    </div>
  );
}
