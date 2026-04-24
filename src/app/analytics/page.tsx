import { Suspense } from "react";
import {
  getAssessmentResultsPageData,
} from "@/src/domains/assessment/api/assessment.api";
import AnalyticsPageView from "@/src/domains/analytics/components/AnalyticsPageView";
import { AnalyticsPageSkeleton } from "@/src/shared/components/layout/PageSkeletons";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Analytics',
};

export default async function AnalyticsPage() {
  const data = await getAssessmentResultsPageData();

  return (
    <Suspense fallback={<AnalyticsPageSkeleton />}>
      <AnalyticsPageView
        assessments={data.assessments}
        assessmentTopics={data.assessment_topics}
        topics={data.topics}
        answerEntries={data.answer_entries}
        answerSheets={data.answer_sheets}
      />
    </Suspense>
  );
}
