import { Suspense } from "react";
import { getAssessmentCatalogPageData, getAssessmentTopics } from "@/src/api/assessment.api";
import DashboardPageView from "@/src/components/dashboard/DashboardPageView";
import { getTopics } from "@/src/api/content.api";
import { ALL_TOPICS_VALUE } from "@/src/utils/topic-utils";
import { WorkspacePageSkeleton } from "@/src/components/ui/layout/PageSkeletons";

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
  
  const [assessmentPage, topics, assessmentTopics] = await Promise.all([
    getAssessmentCatalogPageData(),
    getTopics(),
    getAssessmentTopics(),
  ]);

  return (
    <DashboardPageView
      assessments={assessmentPage.assessments}
      topics={topics}
      assessmentTopics={assessmentTopics}
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
