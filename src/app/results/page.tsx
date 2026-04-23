import type { Metadata } from "next";
import { getAssessmentResultsPageData } from "@/src/domains/assessment/api/assessment.api";
import ResultsPageView from "@/src/domains/assessment/components/results/ResultsPageView";

export const metadata: Metadata = {
  title: "Results | Assessments",
  description: "Cross-assessment submission records, scoring outcomes, and manual review status.",
};

export default async function ResultsPage() {
  const data = await getAssessmentResultsPageData();

  return <ResultsPageView data={data} />;
}
