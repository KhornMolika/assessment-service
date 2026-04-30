import type { QuestionDetailData } from "@/src/domains/content/types/question-detail.types";
import { PageHeaderCard } from "@/src/shared/components/layout/PageHeaderCard";

function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-green-100 text-green-700";
    case "medium":
      return "bg-yellow-100 text-yellow-700";
    case "hard":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function getTypeColor(typeName: string) {
  switch (typeName) {
    case "MCQ":
    case "Multiple Choice":
      return "bg-blue-100 text-blue-700";
    case "True/False":
      return "bg-green-100 text-green-700";
    case "Short Answer":
      return "bg-purple-100 text-purple-700";
    case "Long Essay":
      return "bg-red-100 text-red-700";
    case "Rating":
      return "bg-yellow-100 text-yellow-700";
    case "Ranking":
      return "bg-orange-100 text-orange-700";
    case "Fill-in-blank":
      return "bg-pink-100 text-pink-700";
    case "Matching":
      return "bg-indigo-100 text-indigo-700";
    case "File Upload":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export { getDifficultyColor, getTypeColor };

export default function QuestionDetailHero({
  question,
}: {
  question: QuestionDetailData;
}) {
  return (
    <div className="px-4 pb-6 pt-2 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <PageHeaderCard
          backHref="/questions"
          backLabel="Back to questions"
          title={question.question_text}
          description={
            <div className="flex flex-col gap-1 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <span className="break-all">Question ID: {question.id}</span>
              <span>Used in {question.stats.usedInAssessments} assessments</span>
            </div>
          }
          meta={
            <>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${getTypeColor(question.type.name)}`}>
                {question.type.name}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
              <span className="rounded-full border border-border/70 bg-white px-3 py-1 text-xs font-semibold text-primary/75">
                {question.points} {question.points === 1 ? "Point" : "Points"}
              </span>
            </>
          }
        />
      </div>
    </div>
  );
}
