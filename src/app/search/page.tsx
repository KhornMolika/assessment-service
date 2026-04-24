import { Suspense } from "react";
import type { Metadata } from "next";
import { getAssessmentCatalogPageData } from "@/src/domains/assessment/api/assessment.api";
import { getQuestionCatalogPageData } from "@/src/domains/content/api/content.api";
import SearchPageView from "@/src/domains/search/components/SearchPageView";
import { WorkspacePageSkeleton } from "@/src/shared/components/layout/PageSkeletons";

export const metadata: Metadata = {
  title: "Search",
  description: "Search assessments, question banks, and questions across the workspace.",
};

export default async function SearchPage() {
  const [assessmentData, questionCatalogData] = await Promise.all([
    getAssessmentCatalogPageData(),
    getQuestionCatalogPageData(),
  ]);

  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <SearchPageView
        assessments={assessmentData.assessments}
        banks={questionCatalogData.banks}
        questions={questionCatalogData.questions}
      />
    </Suspense>
  );
}
