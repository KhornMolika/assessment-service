import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";

export default function QuestionBankNewHeader({ formId }: { formId: string }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex items-start gap-4">
        <Link
          href="/banks"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border text-primary transition hover:bg-muted"
          aria-label="Back to banks"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-primary">Create New Question Bank</h1>
          <p className="mt-1 text-sm text-inkd">
            Set up a new collection with clear ownership, discoverability, and reusable tags.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="/banks"
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
          Create Bank
        </button>
      </div>
    </div>
  );
}
