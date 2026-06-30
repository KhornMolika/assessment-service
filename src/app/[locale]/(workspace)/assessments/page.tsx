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
import { Plus } from "lucide-react";
import Pagination from "@/src/components/ui/navigation/Pagination";
import { TopicSelector } from "@/src/components/topic-selector";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/ui/card";
import { useTopicStore } from "@/src/stores/topic-store";
import { useSearchParams } from "next/navigation";
import { useAdminSockets } from "@/src/hooks/useAdminSockets";
import { useTranslations } from "next-intl";

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
  typeFilter,
  statusFilter,
  selectionFilter,
  query,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assessments: any[];
  deliveryFilter: "ALL" | AssessmentDeliveryMode;
  typeFilter: string;
  statusFilter: string;
  selectionFilter: string;
  query: string;
}) {
  const normalizedQuery = query.trim().toLowerCase();

  return assessments.filter((assessment) => {
    if (
      deliveryFilter !== "ALL" &&
      assessment.settings?.mode !== deliveryFilter
    ) {
      return false;
    }

    if (typeFilter !== "ALL" && assessment.type !== typeFilter) {
      return false;
    }

    if (statusFilter !== "ALL" && assessment.status !== statusFilter) {
      return false;
    }

    if (selectionFilter !== "ALL" && assessment.settings?.questionSelection !== selectionFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystacks = [
      assessment.name ?? "",
      assessment.description ?? "",
    ];

    return haystacks.some((value) =>
      value?.toLowerCase().includes(normalizedQuery),
    );
  });
}

export function AssessmentsPageContent() {
  const searchParams = useSearchParams();
  const query = getSingleSearchParam(searchParams.get("query"));
  const deliveryFilter = parseDeliveryFilter(searchParams.get("delivery"));
  const typeFilter = getSingleSearchParam(searchParams.get("type"), "ALL");
  const statusFilter = getSingleSearchParam(searchParams.get("status"), "ALL");
  const selectionFilter = getSingleSearchParam(searchParams.get("selection"), "ALL");
  const currentPage = parsePositiveInteger(searchParams.get("page"), 1);
  const itemsPerPage = parsePositiveInteger(searchParams.get("pageSize"), 10);

  const activeTopic = useTopicStore((s) => s.activeTopic);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [assessments, setAssessments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const t = useTranslations("Assessments");
  
  const updateTick = useAdminSockets();

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTopic?.id ?? "all", updateTick]);

  if (isLoading) {
    return <AssessmentsCatalogLoading />;
  }

  const filteredAssessments = filterAssessments({
    assessments,
    deliveryFilter,
    typeFilter,
    statusFilter,
    selectionFilter,
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

  const hasActiveFilters = 
    query.trim().length > 0 || 
    deliveryFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    selectionFilter !== "ALL";

  return (
    <div className="space-y-6">
      <AssessmentsHeader totalAssessments={assessments.length} />

      <Card className="overflow-hidden embed-transparent-card">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle>
              {t("catalogTitle")} {activeTopic ? `(${activeTopic.name})` : ""}
            </CardTitle>
            <CardDescription className="hidden sm:block">
              {t("catalogDesc")}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <TopicSelector className="embed-only-element" />
            <Link
              href="/assessments/new"
              className="embed-only-element inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pm"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Assessment</span>
              <span className="sm:hidden">New</span>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <AssessmentsCatalogToolbar 
            deliveryFilter={deliveryFilter} 
            typeFilter={typeFilter}
            statusFilter={statusFilter}
            selectionFilter={selectionFilter}
          />
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
              type: typeFilter === "ALL" ? null : typeFilter,
              status: statusFilter === "ALL" ? null : statusFilter,
              selection: selectionFilter === "ALL" ? null : selectionFilter,
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
