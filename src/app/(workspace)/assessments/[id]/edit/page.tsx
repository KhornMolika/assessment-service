import { Suspense } from "react";
import { getEditAssessmentPageData } from "@/src/api/assessment.api";
import AssessmentNewLoading from "@/src/components/assessment/assessment-new/AssessmentNewLoading";
import AssessmentNewWizard from "@/src/components/assessment/assessment-new/AssessmentNewWizard";
import { getTopics } from "@/src/api/topic.api";
import { getBanks } from "@/src/lib/services/banks";
import { getQuestions } from "@/src/lib/services/questions";

async function EditAssessmentPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, topics, banksRes, questionsRes] = await Promise.all([
    getEditAssessmentPageData(id), 
    getTopics(),
    getBanks(1, 100),
    getQuestions(1, 500)
  ]);

  return (
    <AssessmentNewWizard
      mode="edit"
      assessmentId={data.assessmentId}
      banks={banksRes.data}
      questions={questionsRes.data}
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
