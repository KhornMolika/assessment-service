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
  let fetchError: string | undefined;
  const [data, topics, banksRes, questionsRes] = await Promise.all([
    getEditAssessmentPageData(id).catch(e => { fetchError = e.message; return null; }), 
    getTopics().catch(e => { fetchError = e.message; return []; }),
    getBanks(1, 100).catch(e => { fetchError = e.message; return { data: [] }; }),
    // eslint-disable-next-line react-hooks/immutability
    getQuestions(1, 500).catch(e => { fetchError = e.message; return { data: [] }; })
  ]);

  const formData = data ? {
    ...data.initialFormData,
    name: `${data.initialFormData.name.trim().substring(0, 500)} (Copy)`,
    status: "DRAFT" as const,
  } : undefined;

  return (
    <AssessmentForm
      mode="duplicate"
      banks={banksRes?.data || []}
      questions={questionsRes?.data || []}
      topics={topics || []}
      initialFormData={formData}
      fetchError={fetchError}
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
