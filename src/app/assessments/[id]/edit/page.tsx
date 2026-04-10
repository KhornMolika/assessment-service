import { getEditAssessmentPageData } from "@/src/domains/assessment/api/assessment.api";
import AssessmentNewWizard from "@/src/domains/assessment/components/assessment-new/AssessmentNewWizard";

export default async function EditAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getEditAssessmentPageData(id);

  return (
    <AssessmentNewWizard
      mode="edit"
      assessmentId={data.assessmentId}
      banks={data.banks}
      questions={data.questions}
      initialFormData={data.initialFormData}
    />
  );
}
