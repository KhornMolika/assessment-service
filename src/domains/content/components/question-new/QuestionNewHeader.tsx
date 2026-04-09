import Link from "next/link";
import { Save } from "lucide-react";

export default function QuestionNewHeader({ formId }: { formId: string }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-primary">Create New Question</h1>
        <p className="mt-1 text-sm text-inkd">
          Add a new question with clear response rules, grading guidance, and metadata.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/questions"
          className="rounded-lg border border-border px-4 py-2 text-center text-sm font-semibold text-primary transition hover:bg-muted"
        >
          Cancel
        </Link>
        <button
          type="submit"
          form={formId}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-pm"
        >
          <Save className="h-4 w-4" />
          Save Question
        </button>
      </div>
    </div>
  );
}
