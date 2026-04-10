import type { AssessmentDetailPageData } from "@/src/domains/assessment/types/assessment-detail.types";
import AssessmentDetailHero from "./AssessmentDetailHero";
import AssessmentDetailInformationCard from "./AssessmentDetailInformationCard";
import AssessmentQuestionsCard from "./AssessmentQuestionsCard";
import AssessmentSidebar from "./AssessmentSidebar";
import AssessmentTopPerformersCard from "./AssessmentTopPerformersCard";

export default function AssessmentDetailView({
  data,
}: {
  data: AssessmentDetailPageData;
}) {
  const { assessment, questions, recentActivity, topPerformers } = data;

  return (
    <div className="min-h-screen bg-background">
      <AssessmentDetailHero assessment={assessment} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <AssessmentDetailInformationCard assessment={assessment} />
            <AssessmentTopPerformersCard topPerformers={topPerformers} />
            <AssessmentQuestionsCard
              questions={questions}
              totalQuestions={assessment.question_count}
            />
          </div>

          <AssessmentSidebar assessment={assessment} recentActivity={recentActivity} />

        </div>
      </div>
    </div>
  );
}
