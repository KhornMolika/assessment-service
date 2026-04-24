import Link from "next/link";
import { Save } from "lucide-react";
import { PageHeaderCard } from "@/src/shared/components/layout/PageHeaderCard";

export default function QuestionBankNewHeader({ formId }: { formId: string }) {
  return (
    <PageHeaderCard
      backHref="/banks"
      backLabel="Back to banks"
      title="Create New Question Bank"
      description="Set up a new collection with clear ownership, discoverability, and reusable tags."
      actions={
        <>
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
        </>
      }
    />
  );
}
