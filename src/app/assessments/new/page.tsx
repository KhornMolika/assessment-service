import { getNewAssessmentPageData } from "@/src/domains/assessment/api/assessment.api";
import AssessmentNewWizard from "@/src/domains/assessment/components/assessment-new/AssessmentNewWizard";

export default async function NewAssessmentPage() {
  const data = await getNewAssessmentPageData();

  return <AssessmentNewWizard banks={data.banks} questions={data.questions} />;
}

