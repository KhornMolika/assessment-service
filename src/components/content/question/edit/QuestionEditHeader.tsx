import { Save } from "lucide-react";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { Button } from "@/src/components/ui/ui/button";

export default function QuestionEditHeader({
  formId,
}: {
  formId: string;
}) {
  return (
    <PageHeaderCard
      backHref="/questions"
      backLabel="Back to questions"
      title="Edit Question"
      description="Refine wording, grading settings, and metadata before reuse."
      actions={
        <Button
          type="submit"
          form={formId}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-pm"
        >
          <Save className="h-4 w-4" />
          Save question
        </Button>
      }
    >
    </PageHeaderCard>
  );
}
