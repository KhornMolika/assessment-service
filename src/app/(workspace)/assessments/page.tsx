"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import type { AssessmentDeliveryMode } from "@/src/types/assessment.types";
import {
  fetchGlobalAssessments,
  fetchTopicAssessments,
} from "@/src/actions/assessment-actions";
import AssessmentsCatalogLoading from "@/src/components/assessment/assessment-catalog/AssessmentsCatalogLoading";
import AssessmentsCatalogToolbar from "@/src/components/assessment/assessment-catalog/AssessmentsCatalogToolbar";
import AssessmentsHeader from "@/src/components/assessment/assessment-catalog/AssessmentsHeader";
import AssessmentsTableInteractive from "@/src/components/assessment/assessment-catalog/AssessmentsTableInteractive";
import { StateMessage } from "@/src/components/ui/feedback/StateMessage";
import Pagination from "@/src/components/ui/navigation/Pagination";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/ui/card";
import { useTopicStore } from "@/src/stores/topic-store";
import { useSearchParams } from "next/navigation";

function getSingleSearchParam(
  value: string | string[] | null | undefined,
  fallback = "",
) {
  if (Array.isArray(value)) return value[0] ?? fallback;
  return value ?? fallback;
}

function parsePositiveInteger(
  value: string | null | undefined,
  fallback: number,
) {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallback;
  return parsed;
}

function parseDeliveryFilter(
  value: string | null | undefined,
): "ALL" | AssessmentDeliveryMode {
  return value === "SELF_PACED" || value === "REAL_TIME" ? value : "ALL";
}

function filterAssessments({
  assessments,
  deliveryFilter,
  query,
}: {
  assessments: any[];
  deliveryFilter: "ALL" | AssessmentDeliveryMode;
  query: string;
}) {
  const normalizedQuery = query.trim().toLowerCase();

  return assessments.filter((assessment) => {
    if (
      deliveryFilter !== "ALL" &&
      assessment.delivery_mode !== deliveryFilter
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
      assessment.name ?? "",
    ];

    return haystacks.some((value) =>
      value?.toLowerCase().includes(normalizedQuery),
    );
  });
}

function AssessmentsPageContent() {
  const searchParams = useSearchParams();
  const query = getSingleSearchParam(searchParams.get("query"));
  const deliveryFilter = parseDeliveryFilter(searchParams.get("delivery"));
  const currentPage = parsePositiveInteger(searchParams.get("page"), 1);
  const itemsPerPage = parsePositiveInteger(searchParams.get("pageSize"), 10);

  const activeTopic = useTopicStore((s) => s.activeTopic);

  const [assessments, setAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchResources() {
      setIsLoading(true);
      try {
        let fetchedAssessments;
        if (activeTopic === null) {
          fetchedAssessments = await fetchGlobalAssessments();
        } else {
          fetchedAssessments = await fetchTopicAssessments(activeTopic.id);
        }

        if (isMounted) {
          setAssessments(fetchedAssessments);
        }
      } catch (err) {
        console.error("Failed to fetch assessments:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    fetchResources();
    return () => {
      isMounted = false;
    };
  }, [activeTopic?.id ?? "all"]);

  if (isLoading) {
    return <AssessmentsCatalogLoading />;
  }

  const filteredAssessments = filterAssessments({
    assessments,
    deliveryFilter,
    query,
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAssessments.length / itemsPerPage),
  );
  const activePage = Math.min(currentPage, totalPages);
  const paginatedAssessments = filteredAssessments.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage,
  );

  const hasActiveFilters = query.trim().length > 0 || deliveryFilter !== "ALL";

  return (
    <div className="space-y-6">
      <AssessmentsHeader totalAssessments={assessments.length} />

      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <CardTitle>
              Assessment catalog {activeTopic ? `(${activeTopic.name})` : ""}
            </CardTitle>
            <CardDescription>
              Track readiness, delivery mode, and performance signals across the
              workspace.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <AssessmentsCatalogToolbar deliveryFilter={deliveryFilter} />
          <div>
            {filteredAssessments.length === 0 ? (
              <StateMessage
                title={
                  hasActiveFilters
                    ? "No assessments found"
                    : "No assessments available"
                }
                description={
                  hasActiveFilters
                    ? "No assessments match the current search and delivery filters."
                    : "Assessment records will appear here once they are available."
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
              <AssessmentsTableInteractive
                assessments={paginatedAssessments as any}
              />
            )}
          </div>
        </CardContent>

        {filteredAssessments.length > 0 ? (
          <Pagination
            pathname="/assessments"
            searchParams={{
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

export default function AssessmentsPage() {
  return (
    <Suspense fallback={<AssessmentsCatalogLoading />}>
      <AssessmentsPageContent />
    </Suspense>
  );
}
