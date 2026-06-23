import { Suspense } from "react";
import AssessmentForm from "@/src/components/assessment/assessment-new/AssessmentForm";
import AssessmentNewLoading from "@/src/components/assessment/assessment-new/AssessmentNewLoading";
import { getTopics } from "@/src/api/topic.api";
import { getBanks } from "@/src/lib/services/banks";
import { getQuestions } from "@/src/lib/services/questions";

async function NewAssessmentPageContent() {
  const [banksRes, questionsRes, topics] = await Promise.all([
    getBanks(1, 100),
    getQuestions(1, 500),
    getTopics()
  ]);

  return <AssessmentForm banks={banksRes.data} questions={questionsRes.data} topics={topics} />;
}

export default function NewAssessmentPage() {
  return (
    <Suspense fallback={<AssessmentNewLoading />}>
      <NewAssessmentPageContent />
    </Suspense>
  );
}
