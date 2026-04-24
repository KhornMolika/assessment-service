import { Suspense } from "react";
import { getAssessmentCatalogPageData, getMockAssessmentTopics } from "../domains/assessment/api/assessment.api";
import { getDashboardOverviewSections } from "../domains/dashboard/api/dashboard.api";
import DashboardPageView from "../domains/dashboard/components/DashboardPageView";
import { getMockBankTopics, getMockBanks, getMockQuestionTopics, getMockQuestions, getMockTopics } from "../domains/content/api/content.api";
import { WorkspacePageSkeleton } from "../shared/components/layout/PageSkeletons";

export default async function DashboardPage() {
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
    <Suspense fallback={<WorkspacePageSkeleton />}>
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
    </Suspense>
  );
}
