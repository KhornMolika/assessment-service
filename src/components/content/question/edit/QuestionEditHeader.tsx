import { Save } from "lucide-react";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { Button } from "@/src/components/ui/ui/button";

import { TopicSelector } from "@/src/components/topic-selector";

export default function QuestionEditHeader({
  formId,
}: {
  formId: string;
}) {
  return (
    <PageHeaderCard
      backHref="/questions"
      title="Edit Question"
      actions={
        <div className="flex shrink-0 items-center gap-3">
          <TopicSelector />
          <Button
            type="submit"
            form={formId}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-pm"
          >
            <Save className="h-4 w-4" />
            Save question
          </Button>
        </div>
      }
    >
    </PageHeaderCard>
  );
}
