import type { AssessmentDetailPageData } from "@/src/domains/assessment/types/assessment-detail.types";
import AssessmentDetailHero from "./AssessmentDetailHero";
import AssessmentDetailInformationCard from "./AssessmentDetailInformationCard";
import AssessmentQuestionsCard from "./AssessmentQuestionsCard";
import AssessmentSidebar from "./AssessmentSidebar";

export default function AssessmentDetailView({
  data,
}: {
  data: AssessmentDetailPageData;
}) {
  const { assessment, questions } = data;

  return (
    <div>
      <AssessmentDetailHero assessment={assessment} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <AssessmentDetailInformationCard assessment={assessment} />
            <AssessmentQuestionsCard
              questions={questions}
              totalQuestions={assessment.question_count}
            />
          </div>

          <AssessmentSidebar assessment={assessment} />
        </div>
      </div>
    </div>
  );
}
