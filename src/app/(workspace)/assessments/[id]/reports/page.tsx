import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAssessmentScopedResultsPageData } from "@/src/components/assessment/api/assessment.api";
import AssessmentScopedResultsView from "@/src/components/assessment/components/assessment-results/AssessmentScopedResultsView";
import { ResultsPageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Assessment Results",
    description: "Assessment-level results, scoring outcomes, and review progress.",
  };
}

async function AssessmentReportsPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getAssessmentScopedResultsPageData(id);

  if (!data) {
    notFound();
  }

  return <AssessmentScopedResultsView data={data} />;
}

export default function AssessmentReportsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<ResultsPageSkeleton />}>
      <AssessmentReportsPageContent params={params} />
    </Suspense>
  );
}
