import { Suspense } from "react";
import type { Metadata } from "next";
import { getAssessmentResultsPageData } from "@/src/domains/assessment/api/assessment.api";
import ResultsPageView from "@/src/domains/assessment/components/results/ResultsPageView";
import { ResultsPageSkeleton } from "@/src/shared/components/layout/PageSkeletons";

export const metadata: Metadata = {
  title: "Results",
  description: "Cross-assessment submission records, scoring outcomes, and manual review status.",
};

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    { searchParams: { topic: null, query: null, page: null, pageSize: null, bank: null, assessment: null, search: null } },
    { searchParams: { topic: "topic-algebra", query: "quiz", page: "1", pageSize: "10", bank: "bank-1", assessment: "all-assessments", search: "quiz" } },
  ],
};

async function ResultsPageContent() {
  const data = await getAssessmentResultsPageData();

  return <ResultsPageView data={data} />;
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<ResultsPageSkeleton />}>
      <ResultsPageContent />
    </Suspense>
  );
}
