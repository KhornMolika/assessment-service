import { Suspense } from "react";
import type { Metadata } from "next";
import {
  getAssessmentCatalogPageData,
  getMockAssessmentTopics,
} from "@/src/domains/assessment/api/assessment.api";
import {
  getMockBankTopics,
  getMockQuestionTopics,
  getQuestionCatalogPageData,
} from "@/src/domains/content/api/content.api";
import SearchPageView from "@/src/domains/search/components/SearchPageView";
import { WorkspacePageSkeleton } from "@/src/shared/components/layout/PageSkeletons";

export const metadata: Metadata = {
  title: "Search",
  description: "Search assessments, question banks, and questions across the workspace.",
};

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    { searchParams: { topic: null, query: null, page: null, pageSize: null, bank: null, assessment: null, search: null } },
    { searchParams: { topic: "topic-algebra", query: "quiz", page: "1", pageSize: "10", bank: "bank-1", assessment: "all-assessments", search: "quiz" } },
  ],
};

async function SearchPageContent() {
  const [assessmentData, questionCatalogData, assessmentTopics, bankTopics, questionTopics] = await Promise.all([
    getAssessmentCatalogPageData(),
    getQuestionCatalogPageData(),
    getMockAssessmentTopics(),
    getMockBankTopics(),
    getMockQuestionTopics(),
  ]);

  return (
    <SearchPageView
      assessments={assessmentData.assessments}
      banks={questionCatalogData.banks}
      questions={questionCatalogData.questions}
      assessmentTopics={assessmentTopics}
      bankTopics={bankTopics}
      questionTopics={questionTopics}
    />
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}
