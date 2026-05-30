import { Suspense } from "react";
import { getEditAssessmentPageData } from "@/src/components/assessment/api/assessment.api";
import AssessmentNewLoading from "@/src/components/assessment/components/assessment-new/AssessmentNewLoading";
import AssessmentNewWizard from "@/src/components/assessment/components/assessment-new/AssessmentNewWizard";
import { getMockTopics } from "@/src/components/content/api/content.api";

async function EditAssessmentPageContent({
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

export default function EditAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<AssessmentNewLoading />}>
      <EditAssessmentPageContent params={params} />
    </Suspense>
  );
}
