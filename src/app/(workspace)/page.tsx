import { Suspense } from "react";
import { getAssessmentCatalogPageData, getMockAssessmentTopics } from "@/src/domains/assessment/api/assessment.api";
import { getDashboardOverviewSections } from "@/src/domains/dashboard/api/dashboard.api";
import DashboardPageView from "@/src/domains/dashboard/components/DashboardPageView";
import { getMockBankTopics, getMockBanks, getMockQuestionTopics, getMockQuestions, getMockTopics } from "@/src/domains/content/api/content.api";
import { WorkspacePageSkeleton } from "@/src/shared/components/layout/PageSkeletons";

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    { searchParams: { topic: null, query: null, page: null, pageSize: null, bank: null, assessment: null, search: null } },
    { searchParams: { topic: "topic-algebra", query: "quiz", page: "1", pageSize: "10", bank: "bank-1", assessment: "all-assessments", search: "quiz" } },
  ],
};

async function DashboardPageContent() {
  const [dashboardOverview, assessmentPage, banks, questions, topics, assessmentTopics, bankTopics, questionTopics] = await Promise.all([
    getDashboardOverviewSections(),
    getAssessmentCatalogPageData(),
    getMockBanks(),
    getMockQuestions(),
    getMockTopics(),
    getMockAssessmentTopics(),
    getMockBankTopics(),
    getMockQuestionTopics(),
  ]);

  return (
    <DashboardPageView
      quickLaunchpad={dashboardOverview.quickLaunchpad}
      assessments={assessmentPage.assessments}
      banks={banks}
      questions={questions}
      topics={topics}
      assessmentTopics={assessmentTopics}
      bankTopics={bankTopics}
      questionTopics={questionTopics}
    />
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <DashboardPageContent />
    </Suspense>
  );
}
