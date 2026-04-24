import { Suspense } from "react";
import type { Metadata } from "next";
import { getAssessmentResultsPageData } from "@/src/domains/assessment/api/assessment.api";
import ResultsPageView from "@/src/domains/assessment/components/results/ResultsPageView";
import { ResultsPageSkeleton } from "@/src/shared/components/layout/PageSkeletons";

export const metadata: Metadata = {
  title: "Results",
  description: "Cross-assessment submission records, scoring outcomes, and manual review status.",
};

export default async function ResultsPage() {
  const data = await getAssessmentResultsPageData();

  return (
    <Suspense fallback={<ResultsPageSkeleton />}>
      <ResultsPageView data={data} />
    </Suspense>
  );
}
