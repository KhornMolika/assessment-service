import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { QuestionDetailData } from "@/src/domains/content/types/question-detail.types";

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
  onDuplicate,
}: {
  question: QuestionDetailData;
  onDuplicate: () => void;
}) {
  return (
    <div className="bg-linear-to-br from-[#2D6A4F] via-[#2D6A4F] to-[#40916C] px-4 pb-6 pt-2 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center mb-4">
          <Link
            href="/questions"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 text-white transition hover:bg-white/10"
            aria-label="Back to questions"
          >
            <ArrowLeft className="h-5 w-5" />
            
          </Link>
          <h1 className="text-2xl font-bold text-white ml-3">Question Detail</h1>
        </div>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex flex-wrap items-center gap-2 sm:gap-3">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${getTypeColor(question.type.name)}`}>
                {question.type.name}
              </span>
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${getDifficultyColor(question.difficulty)}`}>
                {question.difficulty}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                {question.points} {question.points === 1 ? "Point" : "Points"}
              </span>
            </div>
            <h1 className="mb-3 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              {question.question_text}
            </h1>
            <div className="flex flex-col gap-1 text-sm text-white/70 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <span className="break-all">Question ID: {question.id}</span>
              <span>Used in {question.stats.usedInAssessments} assessments</span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:ml-4 lg:w-auto lg:justify-end">
            <button
              onClick={onDuplicate}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              Duplicate
            </button>
            <Link
              href={`/questions/${question.id}/edit`}
              className="rounded-lg bg-acc px-4 py-2 text-center text-sm font-bold text-primary transition hover:bg-[#95D5B2]"
            >
              Edit Question
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
