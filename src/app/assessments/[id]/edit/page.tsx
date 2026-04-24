import { getEditAssessmentPageData } from "@/src/domains/assessment/api/assessment.api";
import AssessmentNewWizard from "@/src/domains/assessment/components/assessment-new/AssessmentNewWizard";
import { getMockTopics } from "@/src/domains/content/api/content.api";

export default async function EditAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, topics] = await Promise.all([getEditAssessmentPageData(id), getMockTopics()]);

  return (
    <AssessmentNewWizard
      mode="edit"
      assessmentId={data.assessmentId}
      banks={data.banks}
      questions={data.questions}
      topics={topics}
      initialFormData={data.initialFormData}
    />
  );
}
