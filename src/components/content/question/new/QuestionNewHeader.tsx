import Link from "next/link";
import { Save } from "lucide-react";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { Button } from "@/src/components/ui/ui/button";

export default function QuestionNewHeader({ formId }: { formId: string }) {
  return (
    <PageHeaderCard
      backHref="/questions"
      title="Create New Question"
      description="Add a new question to your catalog with clear response rules, grading guidance, and metadata. It will be available for all your assessments immediately."
      actions={
        <div className="flex shrink-0 items-center gap-3">
          <Link
            href="/questions"
            className="rounded-lg border border-border px-4 py-2 text-center text-sm font-semibold text-primary transition hover:bg-muted"
          >
            Cancel
          </Link>
          <Button
            type="submit"
            form={formId}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-pm"
          >
            <Save className="h-4 w-4" />
            Save Question
          </Button>
        </div>
      }
    />
  );
}
