import { CheckCircle, Circle, FileText, Square, Upload } from "lucide-react";
import type { QuestionDetailData } from "@/src/domains/content/types/question-detail.types";

export default function QuestionTypePreview({ question }: { question: QuestionDetailData }) {
  if (question.type.has_options && question.answer_options.length > 0) {
    return (
      <div className="space-y-3">
        <div className="mb-3 text-xs font-semibold uppercase text-inkd">Answer Options</div>
        {question.answer_options
          .sort((a, b) => a.option_order - b.option_order)
          .map((option) => (
            <div
              key={option.id}
              className={`flex flex-col gap-3 rounded-lg border-2 p-4 sm:flex-row sm:items-center sm:gap-4 ${
                option.is_correct ? "border-green-500 bg-green-50" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-3 sm:flex-1">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                    option.is_correct ? "bg-green-500 text-white" : "bg-muted text-inkd"
                  }`}
                >
                  {question.type.name === "Multiple Choice" ? <Square className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
                </div>
                <span className="text-primary">{option.option_text}</span>
              </div>
              {option.is_correct && (
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  CORRECT
                </span>
              )}
            </div>
          ))}
      </div>
    );
  }

  switch (question.type.name) {
    case "Matching": {
      const pairs = (question.correct_answer.pairs as { left: string; right: string }[] | undefined) ?? [];
      return (
        <div>
          <div className="mb-3 text-xs font-semibold uppercase text-inkd">Matching Pairs</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              {pairs.map((pair, index) => (
                <div key={`${pair.left}-${index}`} className="rounded-lg border border-border bg-muted px-4 py-3 text-sm text-primary">
                  {pair.left}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {pairs.map((pair, index) => (
                <div key={`${pair.right}-${index}`} className="rounded-lg border border-border bg-muted px-4 py-3 text-sm text-primary">
                  {pair.right}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    case "Ranking":
      return (
        <div className="rounded-lg border border-border bg-muted px-4 py-4 text-sm text-primary">
          Correct order: {((question.correct_answer.correct_order as string[] | undefined) ?? []).join(" -> ") || "Not configured"}
        </div>
      );
    case "Fill-in-blank":
      return (
        <div className="rounded-lg border border-border bg-muted px-4 py-4 text-sm text-primary">
          Template answer preview: {((question.correct_answer.answers as string[] | undefined) ?? []).join(", ") || "No answers set"}
        </div>
      );
    case "File Upload":
      return (
        <div className="rounded-lg border-2 border-dashed border-border bg-muted px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
              <Upload className="h-6 w-6 text-gray-400" />
            </div>
            <div className="text-sm text-gray-600">Participants upload a file response for manual or AI review.</div>
          </div>
        </div>
      );
    default:
      return (
        <div className="flex items-start gap-2 rounded-lg border border-border bg-muted px-4 py-3 text-sm text-inkd">
          <FileText className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Response preview is not configured for this question type yet.</span>
        </div>
      );
  }
}
