import { Suspense } from "react";
import { getAssessmentCatalogPageData, getMockAssessmentTopics } from "@/src/domains/assessment/api/assessment.api";
import { getDashboardOverviewSections } from "@/src/domains/dashboard/api/dashboard.api";
import DashboardPageView from "@/src/domains/dashboard/components/DashboardPageView";
import { getMockBankTopics, getMockBanks, getMockQuestionTopics, getMockQuestions, getMockTopics } from "@/src/domains/content/api/content.api";
import { ALL_TOPICS_VALUE } from "@/src/domains/content/utils/topic-utils";
import { WorkspacePageSkeleton } from "@/src/shared/components/layout/PageSkeletons";

type DashboardSearchParams = {
  topic?: string | string[];
};

function getSingleSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

async function DashboardPageContent({
  searchParams,
}: {
  searchParams?: Promise<DashboardSearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedTopic =
    getSingleSearchParam(resolvedSearchParams?.topic) ?? ALL_TOPICS_VALUE;
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
      selectedTopic={selectedTopic}
    />
  );
}

export default function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<DashboardSearchParams>;
}) {
  return (
    <Suspense fallback={<WorkspacePageSkeleton />}>
      <DashboardPageContent searchParams={searchParams} />
    </Suspense>
  );
}
