import { Suspense } from "react";
import {
  getAssessmentCatalogPageData,
  getMockAssessmentTopics,
} from "@/src/domains/assessment/api/assessment.api";
import AssessmentsCatalog from "@/src/domains/assessment/components/assessment-catalog/AssessmentsCatalog";
import AssessmentsCatalogLoading from "@/src/domains/assessment/components/assessment-catalog/AssessmentsCatalogLoading";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Assessments',
};

export const unstable_instant = {
  prefetch: "runtime",
  samples: [
    { searchParams: { topic: null, query: null, page: null, pageSize: null, bank: null, assessment: null, search: null } },
    { searchParams: { topic: "topic-algebra", query: "quiz", page: "1", pageSize: "10", bank: "bank-1", assessment: "all-assessments", search: "quiz" } },
  ],
};

async function AssessmentsPageContent() {
  const [data, assessmentTopics] = await Promise.all([
    getAssessmentCatalogPageData(),
    getMockAssessmentTopics(),
  ]);

  return (
    <AssessmentsCatalog
      assessments={data.assessments}
      stats={data.stats}
      assessmentTopics={assessmentTopics}
    />
  );
}

export default function AssessmentsPage() {
  return (
    <Suspense fallback={<AssessmentsCatalogLoading />}>
      <AssessmentsPageContent />
    </Suspense>
  );
}
