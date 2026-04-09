import { getAssessmentCatalogPageData } from "@/src/domains/assessment/api/assessment.api";
import AssessmentsCatalog from "@/src/domains/assessment/components/assessment-catalog/AssessmentsCatalog";

export default async function AssessmentsPage() {
  const data = await getAssessmentCatalogPageData();

  return <AssessmentsCatalog assessments={data.assessments} stats={data.stats} />;
}
