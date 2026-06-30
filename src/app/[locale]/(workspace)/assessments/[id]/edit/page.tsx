import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getEditAssessmentPageData } from "@/src/api/assessment.api";
import { getAssessmentCatalogItemById } from "@/src/api/assessment.api";
import AssessmentNewLoading from "@/src/components/assessment/assessment-new/AssessmentNewLoading";
import AssessmentForm from "@/src/components/assessment/assessment-new/AssessmentForm";
import { getTopics } from "@/src/api/topic.api";
import { getBanks } from "@/src/lib/services/banks";
import { getQuestions } from "@/src/lib/services/questions";

async function EditAssessmentPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Block editing if assessment is archived
  const assessment = await getAssessmentCatalogItemById(id).catch(() => null);
  if (assessment && assessment.status === "ARCHIVED") {
    redirect(`/assessments/${id}?editBlocked=true`);
  }

  let fetchError: string | undefined;
  const [data, topics, banksRes, questionsRes] = await Promise.all([
    getEditAssessmentPageData(id).catch(e => { fetchError = e.message; return null; }), 
    getTopics().catch(e => { fetchError = e.message; return []; }),
    getBanks(1, 100).catch(e => { fetchError = e.message; return { data: [] }; }),
    // eslint-disable-next-line react-hooks/immutability
    getQuestions(1, 500).catch(e => { fetchError = e.message; return { data: [] }; })
  ]);

  return (
    <AssessmentForm
      key={data?.assessmentId || "error"}
      mode="edit"
      assessmentId={data?.assessmentId}
      banks={banksRes?.data || []}
      questions={questionsRes?.data || []}
      topics={topics || []}
      initialFormData={data?.initialFormData}
      fetchError={fetchError}
      status={assessment?.status}
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
