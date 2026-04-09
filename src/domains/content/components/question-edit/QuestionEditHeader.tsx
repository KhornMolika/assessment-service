import Link from "next/link";
import { Save } from "lucide-react";

export default function QuestionEditHeader({
  questionId,
  formId,
}: {
  questionId: string;
  formId: string;
}) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-primary">Edit Question</h1>
        <p className="mt-1 text-sm text-inkd">
          Refine wording, grading settings, and metadata before reuse.
        </p>
        <p className="mt-2 text-xs text-inkd">Question ID: {questionId}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/questions"
          className="rounded-lg border border-border px-4 py-2 text-center text-sm font-semibold text-primary transition hover:bg-muted"
        >
          Back to questions
        </Link>
        <button
          type="submit"
          form={formId}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-pm"
        >
          <Save className="h-4 w-4" />
          Save question
        </button>
      </div>
    </div>
  );
}
