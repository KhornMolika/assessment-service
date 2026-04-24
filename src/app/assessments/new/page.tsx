import { getNewAssessmentPageData } from "@/src/domains/assessment/api/assessment.api";
import AssessmentNewWizard from "@/src/domains/assessment/components/assessment-new/AssessmentNewWizard";
import { getMockTopics } from "@/src/domains/content/api/content.api";

export default async function NewAssessmentPage() {
  const [data, topics] = await Promise.all([getNewAssessmentPageData(), getMockTopics()]);

  return <AssessmentNewWizard banks={data.banks} questions={data.questions} topics={topics} />;
}
