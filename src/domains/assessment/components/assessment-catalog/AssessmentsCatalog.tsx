"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import type { AssessmentDeliveryMode } from "@/src/domains/assessment/types/assessment.types";
import type {
  AssessmentCatalogItem,
  AssessmentCatalogStats,
} from "@/src/domains/assessment/types/assessment-catalog.types";
import type { AssessmentTopicMap } from "@/src/domains/content/types/topic.types";
import { assessmentMatchesTopic } from "@/src/domains/content/utils/topic-utils";
import { ALL_TOPICS_VALUE } from "@/src/domains/content/utils/topic-utils";
import {
  parsePositiveInteger,
  useDebouncedSearchParam,
  useUrlQueryUpdater,
} from "@/src/shared/hooks/use-url-query-state";
import Pagination from "@/src/shared/components/navigation/Pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card";
import AssessmentsHeader from "./AssessmentsHeader";
import AssessmentsStats from "./AssessmentsStats";
import AssessmentsTable from "./AssessmentsTable";

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
        assessment.delivery_mode !== deliveryFilter
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
        assessment.title,
        assessment.question_bank_name,
        assessment.description ?? "",
      ];
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

  const handleDeleteAssessment = (assessmentId: string) => {
    setCatalogAssessments((currentAssessments) =>
      currentAssessments.filter((assessment) => assessment.id !== assessmentId),
    );
  };

  return (
    <div className="space-y-6 px-4 py-4">
      <AssessmentsHeader totalAssessments={stats.totalAssessments} />

      <AssessmentsStats stats={stats} />

      <Card className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <CardTitle>Assessment catalog</CardTitle>
              <CardDescription>
                Track readiness, delivery mode, and performance signals across
                the workspace.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="relative w-full max-w-xl">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-inkl" />
              <input
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
                  <button
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
                  </button>
                );
              })}
            </div>
          </div>

          <AssessmentsTable
            assessments={paginatedAssessments}
            onDeleteAssessment={handleDeleteAssessment}
          />

          <Pagination
            currentPage={activePage}
            totalPages={totalPages}
            pageSize={itemsPerPage}
            totalItems={filteredAssessments.length}
            pageSizeOptions={[5, 10, 20, 50]}
            itemLabel="assessments"
            onPageChange={(page) => updateUrl({ page: page === 1 ? null : page })}
            onPageSizeChange={handlePageSizeChange}
          />
        </CardContent>
      </Card>
    </div>
  );
}
