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

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    { searchParams: { topic: null, query: null, page: null, pageSize: null, bank: null, assessment: null, search: null } },
    { searchParams: { topic: "topic-algebra", query: "quiz", page: "1", pageSize: "10", bank: "bank-1", assessment: "all-assessments", search: "quiz" } },
  ],
};

async function AnalyticsPageContent() {
  const data = await getAssessmentResultsPageData();

  return (
    <AnalyticsPageView
      assessments={data.assessments}
      assessmentTopics={data.assessment_topics}
      topics={data.topics}
      answerEntries={data.answer_entries}
      answerSheets={data.answer_sheets}
    />
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={<AnalyticsPageSkeleton />}>
      <AnalyticsPageContent />
    </Suspense>
  );
}
