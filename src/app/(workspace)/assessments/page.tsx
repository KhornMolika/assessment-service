import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import type { AssessmentDeliveryMode } from "@/src/domains/assessment/types/assessment.types";
import type { AssessmentCatalogItem } from "@/src/domains/assessment/types/assessment-catalog.types";
import {
  getAssessmentCatalogPageData,
  getMockAssessmentTopics,
} from "@/src/domains/assessment/api/assessment.api";
import AssessmentsCatalogLoading from "@/src/domains/assessment/components/assessment-catalog/AssessmentsCatalogLoading";
import AssessmentsCatalogToolbar from "@/src/domains/assessment/components/assessment-catalog/AssessmentsCatalogToolbar";
import AssessmentsHeader from "@/src/domains/assessment/components/assessment-catalog/AssessmentsHeader";
import AssessmentsStats from "@/src/domains/assessment/components/assessment-catalog/AssessmentsStats";
import AssessmentsTableInteractive from "@/src/domains/assessment/components/assessment-catalog/AssessmentsTableInteractive";
import type { AssessmentTopicMap } from "@/src/domains/content/types/topic.types";
import {
  ALL_TOPICS_VALUE,
  assessmentMatchesTopic,
} from "@/src/domains/content/utils/topic-utils";
import { StateMessage } from "@/src/shared/components/feedback/StateMessage";
import LinkPagination from "@/src/shared/components/navigation/LinkPagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/shared/components/ui/card";

export const metadata: Metadata = {
  title: "Assessments",
};

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    { searchParams: { topic: null, query: null, page: null, pageSize: null, delivery: null, bank: null, assessment: null, search: null } },
    { searchParams: { topic: "topic-algebra", query: "quiz", page: "1", pageSize: "10", delivery: "SELF_PACED", bank: "bank-1", assessment: "all-assessments", search: "quiz" } },
  ],
};

type AssessmentSearchParams = Promise<{
  topic?: string | string[];
  query?: string | string[];
  page?: string | string[];
  pageSize?: string | string[];
  delivery?: string | string[];
}>;

function getSingleSearchParam(
  value: string | string[] | undefined,
  fallback = "",
) {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function parsePositiveInteger(value: string | undefined, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return fallback;
  }

  return parsed;
}

function parseDeliveryFilter(value: string | undefined): "ALL" | AssessmentDeliveryMode {
  return value === "SELF_PACED" || value === "REAL_TIME" ? value : "ALL";
}

function filterAssessments({
  assessments,
  assessmentTopics,
  topicFilter,
  deliveryFilter,
  query,
}: {
  assessments: AssessmentCatalogItem[];
  assessmentTopics: AssessmentTopicMap[];
  topicFilter: string;
  deliveryFilter: "ALL" | AssessmentDeliveryMode;
  query: string;
}) {
  const normalizedQuery = query.trim().toLowerCase();

  return assessments.filter((assessment) => {
    if (deliveryFilter !== "ALL" && assessment.delivery_mode !== deliveryFilter) {
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
}

async function AssessmentsPageContent({
  searchParams,
}: {
  searchParams: AssessmentSearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const topicFilter =
    getSingleSearchParam(resolvedSearchParams.topic, ALL_TOPICS_VALUE) ||
    ALL_TOPICS_VALUE;
  const query = getSingleSearchParam(resolvedSearchParams.query);
  const deliveryFilter = parseDeliveryFilter(
    getSingleSearchParam(resolvedSearchParams.delivery),
  );
  const currentPage = parsePositiveInteger(
    getSingleSearchParam(resolvedSearchParams.page),
    1,
  );
  const itemsPerPage = parsePositiveInteger(
    getSingleSearchParam(resolvedSearchParams.pageSize),
    10,
  );

  const [data, assessmentTopics] = await Promise.all([
    getAssessmentCatalogPageData(),
    getMockAssessmentTopics(),
  ]);
  const filteredAssessments = filterAssessments({
    assessments: data.assessments,
    assessmentTopics,
    topicFilter,
    deliveryFilter,
    query,
  });
  const totalPages = Math.max(1, Math.ceil(filteredAssessments.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedAssessments = filteredAssessments.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage,
  );
  const hasActiveFilters =
    query.trim().length > 0 ||
    topicFilter !== ALL_TOPICS_VALUE ||
    deliveryFilter !== "ALL";

  return (
    <div className="space-y-6 px-4 py-4">
      <AssessmentsHeader totalAssessments={data.stats.totalAssessments} />
      <AssessmentsStats stats={data.stats} />

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle>Assessment catalog</CardTitle>
            <CardDescription>
              Track readiness, delivery mode, and performance signals across the workspace.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <AssessmentsCatalogToolbar deliveryFilter={deliveryFilter} />
          <div>
            {filteredAssessments.length === 0 ? (
              <StateMessage
                title={hasActiveFilters ? "No assessments found" : "No assessments available"}
                description={
                  hasActiveFilters
                    ? "No assessments match the current search, topic, and delivery filters."
                    : "Assessment records will appear here once they are available in the workspace."
                }
                action={
                  hasActiveFilters ? (
                    <Link
                      href="/assessments"
                      className="inline-flex items-center justify-center rounded-2xl border border-border bg-white px-5 py-3 text-sm font-semibold text-primary transition hover:bg-muted"
                    >
                      Clear filters
                    </Link>
                  ) : null
                }
              />
            ) : (
              <AssessmentsTableInteractive assessments={paginatedAssessments} />
            )}
          </div>
        </CardContent>

        {filteredAssessments.length > 0 ? (
          <LinkPagination
            pathname="/assessments"
            searchParams={{
              topic: topicFilter === ALL_TOPICS_VALUE ? null : topicFilter,
              query: query || null,
              delivery: deliveryFilter === "ALL" ? null : deliveryFilter,
              pageSize: itemsPerPage === 10 ? null : String(itemsPerPage),
            }}
            currentPage={activePage}
            totalPages={totalPages}
            pageSize={itemsPerPage}
            defaultPageSize={10}
            totalItems={filteredAssessments.length}
            pageSizeOptions={[5, 10, 20, 50]}
            itemLabel="assessments"
          />
        ) : null}
      </Card>
    </div>
  );
}

export default function AssessmentsPage({
  searchParams,
}: {
  searchParams: AssessmentSearchParams;
}) {
  return (
    <Suspense fallback={<AssessmentsCatalogLoading />}>
      <AssessmentsPageContent searchParams={searchParams} />
    </Suspense>
  );
}
