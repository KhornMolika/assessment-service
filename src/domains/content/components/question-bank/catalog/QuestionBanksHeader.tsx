import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeaderCard } from "@/src/shared/components/layout/PageHeaderCard";

export default function QuestionBanksHeader({
  bankCount,
  totalQuestions,
}: {
  bankCount: number;
  totalQuestions: number;
}) {
  return (
    <PageHeaderCard
      title="Question Banks"
      description={`${bankCount} banks · ${totalQuestions} reusable questions`}
      actions={
        <Link
          href="/banks/new"
          className="inline-flex w-60 items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2 font-semibold text-white transition hover:bg-pm"
        >
          <Plus className="h-4 w-4" />
          New bank
        </Link>
      }
    />
  );
}
