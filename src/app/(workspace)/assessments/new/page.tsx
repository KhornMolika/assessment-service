import { Suspense } from "react";
import { getNewAssessmentPageData } from "@/src/domains/assessment/api/assessment.api";
import AssessmentNewWizard from "@/src/domains/assessment/components/assessment-new/AssessmentNewWizard";
import AssessmentNewLoading from "@/src/domains/assessment/components/assessment-new/AssessmentNewLoading";
import { getMockTopics } from "@/src/domains/content/api/content.api";

async function NewAssessmentPageContent() {
  const [data, topics] = await Promise.all([getNewAssessmentPageData(), getMockTopics()]);

  return <AssessmentNewWizard banks={data.banks} questions={data.questions} topics={topics} />;
}

export default function NewAssessmentPage() {
  return (
    <Suspense fallback={<AssessmentNewLoading />}>
      <NewAssessmentPageContent />
    </Suspense>
  );
}
