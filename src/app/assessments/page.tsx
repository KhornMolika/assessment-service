import {
  getAssessmentCatalogPageData,
  getMockAssessmentTopics,
} from "@/src/domains/assessment/api/assessment.api";
import AssessmentsCatalog from "@/src/domains/assessment/components/assessment-catalog/AssessmentsCatalog";

export default async function AssessmentsPage() {
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
