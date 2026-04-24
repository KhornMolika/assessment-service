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

export default async function AssessmentsPage() {
  const [data, assessmentTopics] = await Promise.all([
    getAssessmentCatalogPageData(),
    getMockAssessmentTopics(),
  ]);

  return (
    <Suspense fallback={<AssessmentsCatalogLoading />}>
      <AssessmentsCatalog
        assessments={data.assessments}
        stats={data.stats}
        assessmentTopics={assessmentTopics}
      />
    </Suspense>
  );
}
