import { Copy } from "lucide-react";
import { PageHeaderCard } from "@/src/components/ui/layout/PageHeaderCard";
import { Button } from "@/src/components/ui/ui/button";

export default function QuestionDuplicateHeader({
  formId,
  isPending,
}: {
  formId: string;
  isPending?: boolean;
}) {
  return (
    <PageHeaderCard
      backHref="/questions"
      title="Duplicate Question"
      actions={
        <Button
          type="submit"
          form={formId}
          disabled={isPending}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-pm"
        >
          <Copy className="h-4 w-4" />
          Duplicate
        </Button>
      }
    >
    </PageHeaderCard>
  );
}
