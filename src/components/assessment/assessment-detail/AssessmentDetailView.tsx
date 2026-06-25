import type { AssessmentDetailPageData } from "@/src/types/assessment-detail.types";

import AssessmentDetailInformationCard from "./AssessmentDetailInformationCard";
import AssessmentQuestionsCard from "./AssessmentQuestionsCard";
import AssessmentDetailHeader from "./AssessmentDetailHeader";

export default function AssessmentDetailView({
  data,
}: {
  data: AssessmentDetailPageData;
}) {
  const { assessment, questions } = data;

  return (
    <div className="space-y-6">
      <AssessmentDetailHeader assessment={assessment} />

      <div className="w-full space-y-6">
        <AssessmentDetailInformationCard assessment={assessment} />
        
        <AssessmentQuestionsCard
          assessment={assessment}
          questions={questions}
          totalQuestions={
            assessment.settings?.numQuestions ??
            assessment.question_count ??
            0
          }
        />
      </div>
    </div>
  );
}
