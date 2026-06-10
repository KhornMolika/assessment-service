import { Suspense } from "react";
import { getEditAssessmentPageData } from "@/src/api/assessment.api";
import AssessmentNewLoading from "@/src/components/assessment/assessment-new/AssessmentNewLoading";
import AssessmentNewWizard from "@/src/components/assessment/assessment-new/AssessmentNewWizard";
import { getTopics } from "@/src/api/content.api";

async function EditAssessmentPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, topics] = await Promise.all([getEditAssessmentPageData(id), getTopics()]);

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
