import { Suspense } from "react";
import { getEditAssessmentPageData } from "@/src/api/assessment.api";
import AssessmentNewLoading from "@/src/components/assessment/assessment-new/AssessmentNewLoading";
import AssessmentForm from "@/src/components/assessment/assessment-new/AssessmentForm";
import { getTopics } from "@/src/api/topic.api";
import { getBanks } from "@/src/lib/services/banks";
import { getQuestions } from "@/src/lib/services/questions";

async function DuplicateAssessmentPageContent({
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

  // Adjust formData for duplication
  const formData = {
    ...data.initialFormData,
    name: `${data.initialFormData.name} (Copy)`,
    status: "DRAFT" as const,
  };

  return (
    <AssessmentForm
      mode="duplicate"
      banks={banksRes.data}
      questions={questionsRes.data}
      topics={topics}
      initialFormData={formData}
    />
  );
}

export default function DuplicateAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<AssessmentNewLoading />}>
      <DuplicateAssessmentPageContent params={params} />
    </Suspense>
  );
}
