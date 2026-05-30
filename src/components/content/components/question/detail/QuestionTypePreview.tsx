import { CheckCircle, Circle, FileText, Square, Star, Type, Upload } from "lucide-react";
import type { QuestionDetailData } from "@/src/types/question-detail.types";

export default function QuestionTypePreview({ question }: { question: QuestionDetailData }) {
  if (question.type.has_options && question.answer_options.length > 0) {
    return (
      <div className="space-y-3">
        <div className="mb-3 text-xs font-semibold uppercase text-inkd">Response Preview</div>
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
                  {question.type.name === "Multiple Choice" ? (
                    <Square className="h-4 w-4" />
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>
                <span className="text-primary">{option.option_text}</span>
              </div>
              {option.is_correct ? (
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  CORRECT
                </span>
              ) : null}
            </div>
          ))}
      </div>
    );
  }

  switch (question.type.name) {
    case "Matching": {
      const pairs =
        (question.correct_answer.pairs as { left: string; right: string }[] | undefined) ?? [];

      return (
        <div className="space-y-3">
          <div className="mb-3 text-xs font-semibold uppercase text-inkd">Response Preview</div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              {pairs.map((pair, index) => (
                <div
                  key={`${pair.left}-${index}`}
                  className="rounded-lg border border-border bg-muted px-4 py-3 text-sm text-primary"
                >
                  {pair.left}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {pairs.map((pair, index) => (
                <div
                  key={`${pair.right}-${index}`}
                  className="rounded-lg border border-border bg-muted px-4 py-3 text-sm text-primary"
                >
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
        <div className="space-y-3">
          <div className="mb-3 text-xs font-semibold uppercase text-inkd">Response Preview</div>
          <div className="space-y-2">
            {((question.correct_answer.correct_order as string[] | undefined) ?? []).map(
              (item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="flex items-center gap-3 rounded-lg border border-border bg-muted px-4 py-3 text-sm text-primary"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </div>
              ),
            )}
          </div>
        </div>
      );
    case "Fill-in-blank":
      return (
        <div className="space-y-3">
          <div className="mb-3 text-xs font-semibold uppercase text-inkd">Response Preview</div>
          <div className="rounded-lg border border-border bg-muted px-4 py-4 text-sm text-primary">
            Expected answer:{" "}
            {((question.correct_answer.answers as string[] | undefined) ?? []).join(", ") ||
              "No answers set"}
          </div>
        </div>
      );
    case "Short Answer":
      return (
        <div className="space-y-3">
          <div className="mb-3 text-xs font-semibold uppercase text-inkd">Response Preview</div>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted px-4 py-4">
            <Type className="mt-0.5 h-4 w-4 shrink-0 text-inkd" />
            <div className="space-y-2 text-sm text-primary">
              <div className="font-semibold">Short text response</div>
              <p className="text-inkd">
                Participants respond with a concise written answer. Suggested keywords:{" "}
                {((question.correct_answer.expected_keywords as string[] | undefined) ?? []).join(
                  ", ",
                ) || "Not configured"}
                .
              </p>
            </div>
          </div>
        </div>
      );
    case "Long Essay":
      return (
        <div className="space-y-3">
          <div className="mb-3 text-xs font-semibold uppercase text-inkd">Response Preview</div>
          <div className="flex items-start gap-3 rounded-lg border border-border bg-muted px-4 py-4">
            <FileText className="mt-0.5 h-4 w-4 shrink-0 text-inkd" />
            <div className="space-y-2 text-sm text-primary">
              <div className="font-semibold">Long-form response area</div>
              <p className="text-inkd">
                Participants write a detailed explanation for manual or AI-assisted review.
              </p>
            </div>
          </div>
        </div>
      );
    case "Rating":
      return (
        <div className="space-y-3">
          <div className="mb-3 text-xs font-semibold uppercase text-inkd">Response Preview</div>
          <div className="rounded-lg border border-border bg-muted px-4 py-4">
            <div className="flex items-center gap-2 text-amber-500">
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} className="h-5 w-5 fill-current" />
              ))}
            </div>
            <p className="mt-3 text-sm text-inkd">
              Participants choose a rating value on the configured scale.
            </p>
          </div>
        </div>
      );
    case "File Upload":
      return (
        <div className="space-y-3">
          <div className="mb-3 text-xs font-semibold uppercase text-inkd">Response Preview</div>
          <div className="rounded-lg border-2 border-dashed border-border bg-muted px-4 py-6 sm:px-6 sm:py-8">
            <div className="flex flex-col items-center justify-center gap-3 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              <div className="text-sm text-gray-600">
                Participants upload a file response for manual or AI review.
              </div>
            </div>
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
